
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from src.datacenter_simulator import (
    DataCenterSimulator,
    SimulationError,
)


router = APIRouter(
    prefix="/simulation",
    tags=["Data Center Simulation"]
)

simulator = DataCenterSimulator()


class ServerCreate(BaseModel):
    id: str = Field(
        min_length=1,
        max_length=40,
        pattern=r"^[A-Za-z0-9_-]+$"
    )
    name: str = Field(min_length=1)
    cpu_capacity: float = Field(
        gt=0,
        allow_inf_nan=False
    )
    memory_capacity: float = Field(
        gt=0,
        allow_inf_nan=False
    )


class VMCreate(BaseModel):
    id: str = Field(
        min_length=1,
        max_length=40,
        pattern=r"^[A-Za-z0-9_-]+$"
    )
    name: str = Field(min_length=1)
    cpu: float = Field(gt=0, allow_inf_nan=False)
    memory: float = Field(gt=0, allow_inf_nan=False)


class PlacementRequest(BaseModel):
    vm_id: str
    server_id: str


def execute(operation, *args):
    try:
        state = operation(*args)
        return {
            "success": True,
            "state": state
        }
    except SimulationError as error:
        raise HTTPException(
            status_code=error.status_code,
            detail=str(error)
        ) from error


@router.get("/state")
def get_state():
    return simulator.get_state()


@router.get("/metrics")
def get_metrics():
    return simulator.get_metrics()


@router.post("/reset")
def reset():
    return execute(simulator.reset)


@router.post("/servers", status_code=201)
def create_server(data: ServerCreate):
    return execute(
        simulator.create_server,
        data.id,
        data.name,
        data.cpu_capacity,
        data.memory_capacity
    )


@router.post("/vms", status_code=201)
def create_vm(data: VMCreate):
    return execute(
        simulator.create_vm,
        data.id,
        data.name,
        data.cpu,
        data.memory
    )


@router.post("/allocate")
def allocate_vm(data: PlacementRequest):
    return execute(
        simulator.allocate_vm,
        data.vm_id,
        data.server_id
    )


@router.post("/migrate")
def migrate_vm(data: PlacementRequest):
    return execute(
        simulator.migrate_vm,
        data.vm_id,
        data.server_id
    )
