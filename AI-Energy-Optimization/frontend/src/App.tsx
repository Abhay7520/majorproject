import { Network } from "lucide-react";
import SimulationPage from "./SimulationPage";
import {
  useEffect,
  useState,
} from "react";

import {
  Activity,
  Brain,
  Cpu,
  Gauge,
  Leaf,
  Zap,
  RefreshCw,
  Server,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import {
  optimizeResources,
  predictEnergy,
  predictWorkload,
  checkBackend,
} from "./api";

import type {
  EnergyInput,
  OptimizationResult,
  ResourceData,
} from "./types";


const initialHistory: ResourceData[] = [

  {
    cpu_util_percent: 40,
    mem_util_percent: 50,
    net_in: 100,
    net_out: 80,
    disk_io_percent: 20,
  },

  {
    cpu_util_percent: 45,
    mem_util_percent: 52,
    net_in: 110,
    net_out: 85,
    disk_io_percent: 22,
  },

  {
    cpu_util_percent: 50,
    mem_util_percent: 55,
    net_in: 120,
    net_out: 90,
    disk_io_percent: 25,
  },

  {
    cpu_util_percent: 55,
    mem_util_percent: 58,
    net_in: 130,
    net_out: 95,
    disk_io_percent: 28,
  },
];


const initialEnergy: EnergyInput = {

  cpu_mean: 55,
  cpu_max: 60,
  cpu_min: 50,
  cpu_std: 4,
  cpu_median: 55,

  cpu_frequency_ghz: 2.5,

  memory_util_gb: 8,

  sda_write_count_during_interval: 100,

  sda_read_count_during_interval: 150,
};


function App() {

  const [history, setHistory] =
    useState<ResourceData[]>(initialHistory);

  const [energyInput, setEnergyInput] =
    useState<EnergyInput>(initialEnergy);


  const [predictedWorkload, setPredictedWorkload] =
    useState<number | null>(null);

  const [predictedEnergy, setPredictedEnergy] =
    useState<number | null>(null);

  const [optimization, setOptimization] =
    useState<OptimizationResult | null>(null);


  const [backendOnline, setBackendOnline] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [activePage, setActivePage] =
    useState("dashboard");

  const [error, setError] =
    useState("");


  useEffect(() => {

    checkBackend()
      .then(setBackendOnline);

  }, []);


  function updateHistory(
    index: number,
    field: keyof ResourceData,
    value: number
  ) {

    const updated = [...history];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    setHistory(updated);
  }


  async function runAnalysis() {

    setLoading(true);

    setError("");

    try {

      const workloadResult =
        await predictWorkload(history);


      const workload =
        workloadResult.predicted_cpu_utilization;


      setPredictedWorkload(workload);


      const energyResult =
        await predictEnergy(energyInput);


      setPredictedEnergy(
        energyResult.predicted_energy
      );


      const optimizationResult =
        await optimizeResources({

          current_cpu:
            history[3].cpu_util_percent,

          predicted_workload:
            workload,

          cpu_frequency_ghz:
            energyInput.cpu_frequency_ghz,

          memory_util_gb:
            energyInput.memory_util_gb,

          sda_write_count_during_interval:
            energyInput
              .sda_write_count_during_interval,

          sda_read_count_during_interval:
            energyInput
              .sda_read_count_during_interval,
        });


      setOptimization(
        optimizationResult.optimization
      );


    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );

    } finally {

      setLoading(false);

    }
  }


  const currentCpu =
    history[3].cpu_util_percent;


  return (

    <div className="app">

      {/* SIDEBAR */}

      <aside className="sidebar">

        <div className="brand">

          <div className="brand-icon">
            <Zap size={22} />
          </div>

          <div>
            <h2>GridOpt AI</h2>
            <span>Energy Intelligence</span>
          </div>

        </div>


        <nav>

          <button
            className={
              activePage === "dashboard"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              setActivePage("dashboard")
            }
          >
            <Gauge size={18} />
            Dashboard
          </button>
          <button
            className={
              activePage === "simulation"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() => setActivePage("simulation")}
          >
            <Network size={18} />
            Data Center Simulator
          </button>


          <button
            className={
              activePage === "resources"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              setActivePage("resources")
            }
          >
            <Server size={18} />
            Resource Monitor
          </button>


          <button
            className={
              activePage === "optimization"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              setActivePage("optimization")
            }
          >
            <Brain size={18} />
            AI Optimization
          </button>

        </nav>


        <div className="sidebar-footer">

          <div className="mode-label">
            <span className="status-dot" />
            Simulation Mode
          </div>

          <p>
            Historical workload data with
            AI-powered optimization.
          </p>

        </div>

      </aside>


      {/* MAIN */}

      <main className="main">

        <header className="topbar">

          <div>

            <h1>
              AI Energy Optimization
            </h1>

            <p>
              Cloud Data Center Resource
              Management
            </p>

          </div>


          <div className="backend-status">

            {backendOnline ? (
              <>
                <CheckCircle2 size={16} />
                Backend Online
              </>
            ) : (
              <>
                <AlertCircle size={16} />
                Backend Offline
              </>
            )}

          </div>

        </header>


        {error && (

          <div className="error-box">

            <AlertCircle size={18} />

            {error}

          </div>

        )}
        {/* DATA CENTER SIMULATOR */}

        {activePage === "simulation" && (
          <SimulationPage />
        )}


        {/* DASHBOARD */}

        {activePage === "dashboard" && (

          <>

            <section className="hero">

              <div>

                <span className="eyebrow">
                  AI-POWERED RESOURCE MANAGEMENT
                </span>

                <h2>
                  Optimize energy without
                  sacrificing performance.
                </h2>

                <p>
                  Predict future workload,
                  estimate energy consumption,
                  and identify a more efficient
                  CPU allocation.
                </p>

              </div>


              <button
                className="primary-button"
                onClick={runAnalysis}
                disabled={loading}
              >

                {loading ? (
                  <>
                    <RefreshCw
                      size={18}
                      className="spin"
                    />
                    Running AI...
                  </>
                ) : (
                  <>
                    <Brain size={18} />
                    Run AI Analysis
                  </>
                )}

              </button>

            </section>


            <section className="stat-grid">

              <StatCard
                icon={<Cpu />}
                title="Current CPU"
                value={`${currentCpu.toFixed(1)}%`}
              />

              <StatCard
                icon={<Activity />}
                title="Predicted Workload"
                value={
                  predictedWorkload !== null
                    ? `${predictedWorkload.toFixed(1)}%`
                    : "--"
                }
              />

              <StatCard
                icon={<Zap />}
                title="Predicted Energy"
                value={
                  predictedEnergy !== null
                    ? `${predictedEnergy.toFixed(2)} J`
                    : "--"
                }
              />

              <StatCard
                icon={<Leaf />}
                title="Estimated Saving"
                value={
                  optimization
                    ? `${optimization
                      .estimated_energy_saving_percent
                      .toFixed(1)}%`
                    : "--"
                }
              />

            </section>


            <section className="content-grid">

              <div className="panel">

                <div className="panel-header">

                  <div>

                    <h3>
                      Optimization Result
                    </h3>

                    <p>
                      AI recommendation based on
                      predicted workload.
                    </p>

                  </div>

                </div>


                {optimization ? (

                  <div className="optimization-result">

                    <div className="recommendation">

                      <div className="recommendation-icon">
                        <Brain size={24} />
                      </div>

                      <div>

                        <span>
                          Recommended CPU
                        </span>

                        <strong>
                          {optimization
                            .recommended_cpu
                            .toFixed(1)}%
                        </strong>

                      </div>

                    </div>


                    <div className="comparison">

                      <ComparisonBar
                        label="Current CPU"
                        value={
                          optimization.current_cpu
                        }
                      />

                      <ComparisonBar
                        label="Predicted Workload"
                        value={
                          optimization
                            .predicted_workload
                        }
                      />

                      <ComparisonBar
                        label="Recommended CPU"
                        value={
                          optimization
                            .recommended_cpu
                        }
                      />

                    </div>

                  </div>

                ) : (

                  <div className="empty-state">

                    <Brain size={32} />

                    <p>
                      Run AI Analysis to generate
                      an optimization recommendation.
                    </p>

                  </div>

                )}

              </div>


              <div className="panel">

                <div className="panel-header">

                  <div>

                    <h3>
                      Energy Impact
                    </h3>

                    <p>
                      Predicted before vs after
                      optimization.
                    </p>

                  </div>

                </div>


                {optimization ? (

                  <div className="energy-comparison">

                    <div className="energy-item">

                      <span>
                        Current
                      </span>

                      <strong>
                        {optimization
                          .current_predicted_energy
                          .toFixed(2)} J
                      </strong>

                    </div>


                    <div className="arrow">
                      →
                    </div>


                    <div className="energy-item">

                      <span>
                        Optimized
                      </span>

                      <strong>
                        {optimization
                          .optimized_predicted_energy
                          .toFixed(2)} J
                      </strong>

                    </div>


                    <div className="saving-box">

                      <Leaf size={20} />

                      <div>

                        <span>
                          Estimated saving
                        </span>

                        <strong>
                          {optimization
                            .estimated_energy_saving_percent
                            .toFixed(2)}%
                        </strong>

                      </div>

                    </div>

                  </div>

                ) : (

                  <div className="empty-state">

                    <Zap size={32} />

                    <p>
                      Energy comparison will appear
                      after analysis.
                    </p>

                  </div>

                )}

              </div>

            </section>

          </>

        )}


        {/* RESOURCE PAGE */}

        {activePage === "resources" && (

          <section>

            <div className="page-title">

              <span className="eyebrow">
                RESOURCE MONITOR
              </span>

              <h2>
                Workload History
              </h2>

              <p>
                Provide four consecutive resource
                observations for workload prediction.
              </p>

            </div>


            <div className="panel">

              <div className="resource-table">

                <div className="table-row table-header">

                  <span>Interval</span>
                  <span>CPU %</span>
                  <span>Memory %</span>
                  <span>Net In</span>
                  <span>Net Out</span>
                  <span>Disk I/O %</span>

                </div>


                {history.map(
                  (row, index) => (

                    <div
                      className="table-row"
                      key={index}
                    >

                      <span>
                        T-{3 - index}
                      </span>


                      <NumberInput
                        value={
                          row.cpu_util_percent
                        }
                        onChange={(value) =>
                          updateHistory(
                            index,
                            "cpu_util_percent",
                            value
                          )
                        }
                      />


                      <NumberInput
                        value={
                          row.mem_util_percent
                        }
                        onChange={(value) =>
                          updateHistory(
                            index,
                            "mem_util_percent",
                            value
                          )
                        }
                      />


                      <NumberInput
                        value={row.net_in}
                        onChange={(value) =>
                          updateHistory(
                            index,
                            "net_in",
                            value
                          )
                        }
                      />


                      <NumberInput
                        value={row.net_out}
                        onChange={(value) =>
                          updateHistory(
                            index,
                            "net_out",
                            value
                          )
                        }
                      />


                      <NumberInput
                        value={
                          row.disk_io_percent
                        }
                        onChange={(value) =>
                          updateHistory(
                            index,
                            "disk_io_percent",
                            value
                          )
                        }
                      />

                    </div>

                  )
                )}

              </div>

            </div>


            <div className="panel energy-input-panel">

              <div className="panel-header">

                <div>

                  <h3>
                    Energy Model Inputs
                  </h3>

                  <p>
                    Parameters used by the energy
                    prediction model.
                  </p>

                </div>

              </div>


              <div className="input-grid">

                <InputField
                  label="CPU Mean %"
                  value={
                    energyInput.cpu_mean
                  }
                  onChange={(value) =>
                    setEnergyInput({
                      ...energyInput,
                      cpu_mean: value,
                    })
                  }
                />

                <InputField
                  label="CPU Max %"
                  value={
                    energyInput.cpu_max
                  }
                  onChange={(value) =>
                    setEnergyInput({
                      ...energyInput,
                      cpu_max: value,
                    })
                  }
                />

                <InputField
                  label="CPU Min %"
                  value={
                    energyInput.cpu_min
                  }
                  onChange={(value) =>
                    setEnergyInput({
                      ...energyInput,
                      cpu_min: value,
                    })
                  }
                />

                <InputField
                  label="CPU Std"
                  value={
                    energyInput.cpu_std
                  }
                  onChange={(value) =>
                    setEnergyInput({
                      ...energyInput,
                      cpu_std: value,
                    })
                  }
                />

                <InputField
                  label="CPU Median %"
                  value={
                    energyInput.cpu_median
                  }
                  onChange={(value) =>
                    setEnergyInput({
                      ...energyInput,
                      cpu_median: value,
                    })
                  }
                />

                <InputField
                  label="CPU Frequency GHz"
                  value={
                    energyInput.cpu_frequency_ghz
                  }
                  onChange={(value) =>
                    setEnergyInput({
                      ...energyInput,
                      cpu_frequency_ghz: value,
                    })
                  }
                />

                <InputField
                  label="Memory GB"
                  value={
                    energyInput.memory_util_gb
                  }
                  onChange={(value) =>
                    setEnergyInput({
                      ...energyInput,
                      memory_util_gb: value,
                    })
                  }
                />

                <InputField
                  label="Disk Writes"
                  value={
                    energyInput
                      .sda_write_count_during_interval
                  }
                  onChange={(value) =>
                    setEnergyInput({
                      ...energyInput,
                      sda_write_count_during_interval:
                        value,
                    })
                  }
                />

                <InputField
                  label="Disk Reads"
                  value={
                    energyInput
                      .sda_read_count_during_interval
                  }
                  onChange={(value) =>
                    setEnergyInput({
                      ...energyInput,
                      sda_read_count_during_interval:
                        value,
                    })
                  }
                />

              </div>


              <button
                className="primary-button"
                onClick={runAnalysis}
                disabled={loading}
              >

                <Brain size={18} />

                {loading
                  ? "Running..."
                  : "Run AI Analysis"}

              </button>

            </div>
            {(predictedWorkload !== null ||
              predictedEnergy !== null ||
              optimization !== null) && (

                <div className="analysis-results">

                  <div className="panel">

                    <div className="panel-header">

                      <div>
                        <h3>AI Analysis Results</h3>
                        <p>
                          Results generated from the FastAPI AI models.
                        </p>
                      </div>

                      <CheckCircle2
                        size={20}
                        className="result-icon"
                      />

                    </div>


                    <div className="result-grid">

                      <div className="result-card">

                        <span>Predicted Workload</span>

                        <strong>
                          {predictedWorkload !== null
                            ? `${predictedWorkload.toFixed(2)}%`
                            : "--"}
                        </strong>

                        <small>
                          Next CPU utilization
                        </small>

                      </div>


                      <div className="result-card">

                        <span>Predicted Energy</span>

                        <strong>
                          {predictedEnergy !== null
                            ? `${predictedEnergy.toFixed(2)} J`
                            : "--"}
                        </strong>

                        <small>
                          Estimated energy consumption
                        </small>

                      </div>


                      <div className="result-card recommended-card">

                        <span>Recommended CPU</span>

                        <strong>
                          {optimization
                            ? `${optimization.recommended_cpu.toFixed(2)}%`
                            : "--"}
                        </strong>

                        <small>
                          AI optimized allocation
                        </small>

                      </div>


                      <div className="result-card saving-card">

                        <span>Estimated Energy Saving</span>

                        <strong>
                          {optimization
                            ? `${optimization
                              .estimated_energy_saving_percent
                              .toFixed(2)}%`
                            : "--"}
                        </strong>

                        <small>
                          Compared with current allocation
                        </small>

                      </div>

                    </div>


                    {optimization && (

                      <div className="resource-recommendation">

                        <div className="recommendation-icon">
                          <Brain size={22} />
                        </div>

                        <div>

                          <strong>
                            AI Recommendation
                          </strong>

                          <p>
                            Current CPU allocation is{" "}
                            <b>
                              {optimization.current_cpu.toFixed(1)}%
                            </b>
                            . Based on the predicted workload of{" "}
                            <b>
                              {optimization.predicted_workload.toFixed(1)}%
                            </b>
                            , the optimizer recommends{" "}
                            <b>
                              {optimization.recommended_cpu.toFixed(1)}%
                            </b>
                            {" "}CPU allocation.
                          </p>

                        </div>

                      </div>

                    )}

                  </div>

                </div>

              )}

          </section>

        )}


        {/* OPTIMIZATION PAGE */}

        {activePage === "optimization" && (

          <section>

            <div className="page-title">

              <span className="eyebrow">
                AI OPTIMIZATION ENGINE
              </span>

              <h2>
                Resource Allocation
              </h2>

              <p>
                Compare candidate CPU allocations
                against predicted workload and
                estimated energy consumption.
              </p>

            </div>


            {!optimization ? (

              <div className="panel empty-state large">

                <Brain size={48} />

                <h3>
                  No optimization result yet
                </h3>

                <p>
                  Run the AI analysis from the
                  dashboard to generate recommendations.
                </p>

                <button
                  className="primary-button"
                  onClick={runAnalysis}
                  disabled={loading}
                >
                  <Brain size={18} />
                  Run AI Analysis
                </button>

              </div>

            ) : (

              <>

                <div className="stat-grid">

                  <StatCard
                    icon={<Cpu />}
                    title="Current Allocation"
                    value={
                      `${optimization
                        .current_cpu
                        .toFixed(1)}%`
                    }
                  />

                  <StatCard
                    icon={<Activity />}
                    title="Predicted Demand"
                    value={
                      `${optimization
                        .predicted_workload
                        .toFixed(1)}%`
                    }
                  />

                  <StatCard
                    icon={<Brain />}
                    title="AI Recommendation"
                    value={
                      `${optimization
                        .recommended_cpu
                        .toFixed(1)}%`
                    }
                  />

                  <StatCard
                    icon={<Leaf />}
                    title="Energy Saving"
                    value={
                      `${optimization
                        .estimated_energy_saving_percent
                        .toFixed(1)}%`
                    }
                  />

                </div>


                <div className="panel">

                  <div className="panel-header">

                    <div>

                      <h3>
                        Candidate Allocations
                      </h3>

                      <p>
                        Allocations evaluated by
                        the optimization engine.
                      </p>

                    </div>

                  </div>


                  <div className="candidate-list">

                    {optimization
                      .candidate_allocations
                      .map(
                        (candidate, index) => (

                          <div
                            className={
                              candidate.cpu_allocation ===
                                optimization.recommended_cpu
                                ? "candidate recommended"
                                : "candidate"
                            }
                            key={index}
                          >

                            <div>

                              <strong>
                                {candidate
                                  .cpu_allocation
                                  .toFixed(1)}%
                              </strong>

                              <span>
                                CPU allocation
                              </span>

                            </div>


                            <div>

                              <strong>
                                {candidate
                                  .predicted_energy
                                  .toFixed(2)} J
                              </strong>

                              <span>
                                predicted energy
                              </span>

                            </div>


                            <div>

                              {candidate.feasible ? (
                                <span className="badge good">
                                  Feasible
                                </span>
                              ) : (
                                <span className="badge">
                                  Insufficient
                                </span>
                              )}

                            </div>


                            {candidate.cpu_allocation ===
                              optimization.recommended_cpu && (

                                <span className="recommended-label">
                                  AI Recommended
                                </span>

                              )}

                          </div>

                        )
                      )}

                  </div>

                </div>

              </>

            )}

          </section>

        )}


        <footer>

          <span>
            AI-Based Energy Optimization
          </span>

          <span>
            Decision-support simulation •
            Historical workload data
          </span>

        </footer>

      </main>

    </div>
  );
}


/* =========================================
   COMPONENTS
========================================= */


function StatCard({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {

  return (

    <div className="stat-card">

      <div className="stat-icon">
        {icon}
      </div>

      <div>

        <span>
          {title}
        </span>

        <strong>
          {value}
        </strong>

      </div>

    </div>

  );
}


function NumberInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {

  return (

    <input
      className="table-input"
      type="number"
      value={value}
      onChange={(event) =>
        onChange(
          Number(event.target.value)
        )
      }
    />

  );
}


function InputField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {

  return (

    <label className="input-field">

      <span>
        {label}
      </span>

      <input
        type="number"
        value={value}
        onChange={(event) =>
          onChange(
            Number(event.target.value)
          )
        }
      />

    </label>

  );
}


function ComparisonBar({
  label,
  value,
}: {
  label: string;
  value: number;
}) {

  return (

    <div className="comparison-row">

      <div className="comparison-label">

        <span>
          {label}
        </span>

        <strong>
          {value.toFixed(1)}%
        </strong>

      </div>

      <div className="bar">

        <div
          className="bar-fill"
          style={{
            width: `${Math.min(
              Math.max(value, 0),
              100
            )}%`,
          }}
        />

      </div>

    </div>

  );
}


export default App;