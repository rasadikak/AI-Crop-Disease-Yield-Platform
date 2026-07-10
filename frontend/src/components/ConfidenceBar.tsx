interface ConfidenceBarProps {
  label: string;
  value: number;      // the kg/ha value
  low: number;        // confidence_low
  high: number;       // confidence_high
  unit?: string;
}

const ConfidenceBar = ({ label, value, low, high, unit = "kg/ha" }: ConfidenceBarProps) => {
  // calculate where the prediction sits within a reasonable range
  const range = high - low;
  const position = range > 0 ? ((value - low) / range) * 100 : 50;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">

      {/* main prediction value */}
      <div className="text-center mb-4">
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{label}</p>
        <p className="text-3xl font-bold text-green-800">
          {value.toLocaleString()}
          <span className="text-base font-normal text-gray-400 ml-1">{unit}</span>
        </p>
      </div>

      {/* confidence range bar */}
      <div className="mt-3">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Low estimate</span>
          <span>High estimate</span>
        </div>

        {/* track */}
        <div className="relative h-3 bg-gray-100 rounded-full">
          {/* filled range */}
          <div className="absolute inset-0 bg-green-100 rounded-full" />

          {/* prediction marker */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-green-700 rounded-full shadow border-2 border-white"
            style={{ left: `calc(${Math.min(Math.max(position, 5), 95)}% - 8px)` }}
          />
        </div>

        {/* low and high values */}
        <div className="flex justify-between text-xs font-medium text-gray-500 mt-1.5">
          <span>{low.toLocaleString()} {unit}</span>
          <span>{high.toLocaleString()} {unit}</span>
        </div>
      </div>

      {/* range width as confidence indicator */}
      <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${range < 500 ? "bg-green-500" : range < 1000 ? "bg-yellow-400" : "bg-orange-400"}`} />
        <p className="text-xs text-gray-400">
          {range < 500
            ? "High confidence — narrow prediction range"
            : range < 1000
            ? "Moderate confidence — some variability expected"
            : "Lower confidence — wide prediction range"}
        </p>
      </div>
    </div>
  );
};

export default ConfidenceBar;