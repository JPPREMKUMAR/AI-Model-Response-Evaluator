
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const Analytics = ({ evaluations = [] }) => {
  const completedEvaluations = evaluations.filter(
    (evaluation) => evaluation.status === "completed"
  );

  const pendingEvaluations = evaluations.filter(
    (evaluation) => evaluation.status === "pending"
  );

  // Calculate average evaluation score
  const allScores = completedEvaluations.flatMap((evaluation) =>
    evaluation.responses.map((response) => response.totalScore || 0)
  );

  const averageScore =
    allScores.length > 0
      ? (
          allScores.reduce((sum, score) => sum + score, 0) /
          allScores.length
        ).toFixed(2)
      : "0.00";

  // Calculate model performance
  const modelStats = {};

  completedEvaluations.forEach((evaluation) => {
    evaluation.responses.forEach((response) => {
      if (!modelStats[response.model]) {
        modelStats[response.model] = {
          model: response.model,
          totalScore: 0,
          evaluations: 0,
          wins: 0,
        };
      }

      modelStats[response.model].totalScore += response.totalScore || 0;
      modelStats[response.model].evaluations += 1;
    });

    if (evaluation.winner && modelStats[evaluation.winner]) {
      modelStats[evaluation.winner].wins += 1;
    }
  });

  const modelPerformance = Object.values(modelStats).map((model) => ({
    model: model.model,
    averageScore: Number(
      (model.totalScore / model.evaluations).toFixed(2)
    ),
    wins: model.wins,
  }));

  // Evaluation status data
  const statusData = [
    {
      name: "Completed",
      value: completedEvaluations.length,
    },
    {
      name: "Pending",
      value: pendingEvaluations.length,
    },
  ];

  const COLORS = ["#10b981", "#f59e0b"];

  // Evaluation trend
  const trendMap = {};

  completedEvaluations.forEach((evaluation) => {
    const date = new Date(evaluation.createdAt).toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
      }
    );

    trendMap[date] = (trendMap[date] || 0) + 1;
  });

  const trendData = Object.entries(trendMap).map(([date, count]) => ({
    date,
    evaluations: count,
  }));

  return (
    <div className="space-y-6">

      {/* Analytics Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">
          Analytics Overview
        </h2>

        <p className="mt-1 text-sm text-gray-400">
          Insights from your AI model evaluations
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {/* Total Evaluations */}
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
          <p className="text-sm text-gray-400">
            Total Evaluations
          </p>

          <h3 className="mt-2 text-3xl font-bold text-white">
            {evaluations.length}
          </h3>
        </div>

        {/* Completed */}
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
          <p className="text-sm text-gray-400">
            Completed
          </p>

          <h3 className="mt-2 text-3xl font-bold text-emerald-400">
            {completedEvaluations.length}
          </h3>
        </div>

        {/* Pending */}
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
          <p className="text-sm text-gray-400">
            Pending
          </p>

          <h3 className="mt-2 text-3xl font-bold text-amber-400">
            {pendingEvaluations.length}
          </h3>
        </div>

        {/* Average Score */}
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
          <p className="text-sm text-gray-400">
            Average Score
          </p>

          <h3 className="mt-2 text-3xl font-bold text-blue-400">
            {averageScore}
            <span className="ml-1 text-base text-gray-500">
              /10
            </span>
          </h3>
        </div>

      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Model Performance */}
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">

          <h3 className="mb-6 text-lg font-semibold text-white">
            Model Performance
          </h3>

          {modelPerformance.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={modelPerformance}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#374151"
                />

                <XAxis
                  dataKey="model"
                  stroke="#9ca3af"
                />

                <YAxis
                  domain={[0, 10]}
                  stroke="#9ca3af"
                />

                <Tooltip />

                <Legend />

                <Bar
                  dataKey="averageScore"
                  name="Average Score"
                  fill="#6366f1"
                  radius={[6, 6, 0, 0]}
                />

                <Bar
                  dataKey="wins"
                  name="Wins"
                  fill="#10b981"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-gray-500">
              Complete evaluations to view model performance.
            </div>
          )}

        </div>

        {/* Evaluation Status */}
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">

          <h3 className="mb-6 text-lg font-semibold text-white">
            Evaluation Status
          </h3>

          {evaluations.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="name"
                  label
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index]}
                    />
                  ))}
                </Pie>

                <Tooltip />

                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-gray-500">
              No evaluations available.
            </div>
          )}

        </div>

      </div>

      {/* Evaluation Trend */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">

        <h3 className="mb-6 text-lg font-semibold text-white">
          Evaluation Activity
        </h3>

        {trendData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trendData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#374151"
              />

              <XAxis
                dataKey="date"
                stroke="#9ca3af"
              />

              <YAxis
                allowDecimals={false}
                stroke="#9ca3af"
              />

              <Tooltip />

              <Bar
                dataKey="evaluations"
                name="Evaluations"
                fill="#8b5cf6"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[300px] items-center justify-center text-gray-500">
            No evaluation activity yet.
          </div>
        )}

      </div>

    </div>
  );
};

export default Analytics;
