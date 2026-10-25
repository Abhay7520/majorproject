from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from backend.simulation_routes import router as simulation_router

from backend.schemas import (
    WorkloadHistory,
    EnergyInput,
    OptimizationInput
)

from backend.model_service import (
    ModelService
)


# =========================================
# FASTAPI APPLICATION
# =========================================

app = FastAPI(
    title="AI Energy Optimization API",
    description=(
        "Backend API for AI-based cloud "
        "data center resource management."
    ),
    version="1.0.0"
)
app.include_router(simulation_router)


# =========================================
# CORS
# =========================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=["*"],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"]
)


# =========================================
# LOAD MODELS
# =========================================

model_service = ModelService()


# =========================================
# ROOT
# =========================================

@app.get("/")
def root():

    return {
        "message":
            "AI Energy Optimization API is running.",

        "status":
            "online"
    }


# =========================================
# HEALTH CHECK
# =========================================

@app.get("/health")
def health():

    return {

        "status":
            "healthy",

        "energy_model":
            "loaded",

        "workload_model":
            "loaded"
    }


# =========================================
# WORKLOAD PREDICTION
# =========================================

@app.post("/predict/workload")
def predict_workload(
    data: WorkloadHistory
):

    try:

        prediction = (
            model_service.predict_workload(
                data.history
            )
        )

        return {

            "success":
                True,

            "predicted_cpu_utilization":
                prediction,

            "unit":
                "percent"
        }

    except Exception as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


# =========================================
# ENERGY PREDICTION
# =========================================

@app.post("/predict/energy")
def predict_energy(
    data: EnergyInput
):

    try:

        prediction = (
            model_service.predict_energy(
                data
            )
        )

        return {

            "success":
                True,

            "predicted_energy":
                prediction,

            "unit":
                "joules"
        }

    except Exception as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


# =========================================
# RESOURCE OPTIMIZATION
# =========================================

@app.post("/optimize")
def optimize_resources(
    data: OptimizationInput
):

    try:

        result = (
            model_service.optimize_resources(
                data
            )
        )

        return {

            "success":
                True,

            "optimization":
                result
        }

    except Exception as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )