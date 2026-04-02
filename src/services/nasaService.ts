import env from "../config/env";

const BASE_URL = "https://api.nasa.gov/neo/rest/v1";

type RawNASAObject = any;

const request = async (path: string, params: Record<string, string>) => {
  const url = new URL(`${BASE_URL}${path}`);
  Object.entries({ ...params, api_key: env.NASA_API_KEY }).forEach(([k, v]) =>
    url.searchParams.set(k, v)
  );
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`NASA API request failed (${response.status})`);
  }
  return (await response.json()) as any;
};

export const transformNASAObject = (rawObject: RawNASAObject) => {
  const closeApproaches = (rawObject.close_approach_data ?? []).map((entry: any) => ({
    closeApproachDate: new Date(entry.close_approach_date_full ?? entry.close_approach_date),
    relativeVelocityKmS: Number(entry.relative_velocity?.kilometers_per_second ?? 0),
    missDistanceKm: Number(entry.miss_distance?.kilometers ?? 0),
    orbitingBody: entry.orbiting_body ?? "Earth",
  }));

  return {
    asteroid: {
      nasaId: String(rawObject.id ?? rawObject.neo_reference_id),
      name: rawObject.name,
      estimatedDiameterMinKm: Number(
        rawObject.estimated_diameter?.kilometers?.estimated_diameter_min ?? 0
      ),
      estimatedDiameterMaxKm: Number(
        rawObject.estimated_diameter?.kilometers?.estimated_diameter_max ?? 0
      ),
      isPotentiallyHazardous: Boolean(rawObject.is_potentially_hazardous_asteroid),
      absoluteMagnitude: Number(rawObject.absolute_magnitude_h ?? 0),
    },
    closeApproaches,
    raw: rawObject,
  };
};

export const fetchNEOFeed = async (startDate: string, endDate: string) => {
  const data = await request("/feed", {
    start_date: startDate,
    end_date: endDate,
  });
  const objects = Object.values(data.near_earth_objects ?? {}).flat() as RawNASAObject[];
  return objects.map(transformNASAObject);
};

export const fetchAsteroidById = async (nasaId: string) => {
  const data = await request(`/neo/${nasaId}`, {});
  return transformNASAObject(data);
};

export const fetchBrowseNEOs = async (page = 0, size = 20) => {
  const data = await request("/neo/browse", {
    page: String(page),
    size: String(size),
  });
  const objects = (data.near_earth_objects ?? []) as RawNASAObject[];
  return objects.map(transformNASAObject);
};
