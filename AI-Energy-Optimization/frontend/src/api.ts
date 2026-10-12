import type {
  ResourceData,
  EnergyInput,
  OptimizationInput,
  WorkloadResponse,
  EnergyResponse,
  OptimizationResponse,
} from "./types";


const API_BASE_URL = "http://127.0.0.1:8000";


export async function predictWorkload(
  history: ResourceData[]
): Promise<WorkloadResponse> {

  const response = await fetch(
    `${API_BASE_URL}/predict/workload`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        history,
      }),
    }
  );


  if (!response.ok) {

    const error = await response.json();

    throw new Error(
      error.detail || "Workload prediction failed."
    );
  }


  return response.json();
}


export async function predictEnergy(
  data: EnergyInput
): Promise<EnergyResponse> {

  const response = await fetch(
    `${API_BASE_URL}/predict/energy`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(data),
    }
  );


  if (!response.ok) {

    const error = await response.json();

    throw new Error(
      error.detail || "Energy prediction failed."
    );
  }


  return response.json();
}


export async function optimizeResources(
  data: OptimizationInput
): Promise<OptimizationResponse> {

  const response = await fetch(
    `${API_BASE_URL}/optimize`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(data),
    }
  );


  if (!response.ok) {

    const error = await response.json();

    throw new Error(
      error.detail || "Optimization failed."
    );
  }


  return response.json();
}


export async function checkBackend(): Promise<boolean> {

  try {

    const response = await fetch(
      `${API_BASE_URL}/health`
    );

    return response.ok;

  } catch {

    return false;
  }
}