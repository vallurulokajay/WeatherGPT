import { UserLocation } from '../types';

export class LocationService {
  private static cachedLocation: UserLocation | null = null;
  private static pendingPromise: Promise<UserLocation | null> | null = null;

  public static isSupported(): boolean {
    return typeof window !== 'undefined' && 'geolocation' in navigator;
  }

  public static getCachedLocation(): UserLocation | null {
    return this.cachedLocation;
  }

  public static setCachedLocation(loc: UserLocation | null): void {
    this.cachedLocation = loc;
  }

  /**
   * Request user coordinates using the standard browser Geolocation API.
   * If a request is already in-flight, reuses that promise to prevent duplicate prompts.
   */
  public static async requestLocation(timeoutMs = 6000): Promise<UserLocation | null> {
    if (!this.isSupported()) {
      return null;
    }

    if (this.pendingPromise) {
      return this.pendingPromise;
    }

    this.pendingPromise = new Promise<UserLocation | null>((resolve) => {
      let settled = false;

      const timer = setTimeout(() => {
        if (!settled) {
          settled = true;
          this.pendingPromise = null;
          resolve(this.cachedLocation);
        }
      }, timeoutMs);

      try {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            if (!settled) {
              settled = true;
              clearTimeout(timer);
              this.pendingPromise = null;
              const loc: UserLocation = {
                latitude: Number(position.coords.latitude.toFixed(4)),
                longitude: Number(position.coords.longitude.toFixed(4)),
              };
              this.cachedLocation = loc;
              resolve(loc);
            }
          },
          (_error) => {
            if (!settled) {
              settled = true;
              clearTimeout(timer);
              this.pendingPromise = null;
              // User denied, unavailable, or errored
              resolve(null);
            }
          },
          {
            enableHighAccuracy: false,
            timeout: timeoutMs,
            maximumAge: 300000, // 5 min cache
          }
        );
      } catch {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          this.pendingPromise = null;
          resolve(null);
        }
      }
    });

    return this.pendingPromise;
  }

  /**
   * Watch permission state if browser supports navigator.permissions
   */
  public static setupPermissionListener(
    onStatusChange: (status: 'prompt' | 'granted' | 'denied', location: UserLocation | null) => void
  ): () => void {
    if (typeof navigator === 'undefined' || !('permissions' in navigator)) {
      return () => {};
    }

    let active = true;

    navigator.permissions
      .query({ name: 'geolocation' })
      .then((status) => {
        if (!active) return;

        const update = async () => {
          if (!active) return;
          if (status.state === 'granted') {
            const loc = await this.requestLocation();
            if (active) onStatusChange('granted', loc);
          } else if (status.state === 'denied') {
            this.cachedLocation = null;
            if (active) onStatusChange('denied', null);
          } else {
            if (active) onStatusChange('prompt', this.cachedLocation);
          }
        };

        status.addEventListener('change', update);
      })
      .catch(() => {
        // Permissions query not supported or failed
      });

    return () => {
      active = false;
    };
  }
}
