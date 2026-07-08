import  {useState} from "react";
import api from "../../services/api";

const CropYieldPredictorPage=()=>{

    const CROPS= ['Cassava', 'Maize', 'Plantains and others', 'Potatoes',
         'Rice, paddy', 'Sorghum', 'Soybeans', 'Sweet potatoes']

    const [crop, setCrop]= useState("");
    const [year, setYear]= useState("");
    const [temp, setTemp]= useState("");
    const [pesticides, setPesticides]= useState("");

    const [isLoading, setIsLoading]= useState(false);
    const [error, setError]= useState("");

    const [result, setResult] = useState<any>(null);

    const handleSubmit= async(e:React.FormEvent)=>{

        console.log("handleSubmit fired");
        e.preventDefault();
        setError("");

        if(!crop || !year || !temp || !pesticides){
            setError("All fields are required");
            return;
        }

        const yearNum = Number(year);
        const tempNum = Number(temp);
        const pesticidesNum = Number(pesticides);
        const currentYear = new Date().getFullYear();

        if (!Number.isFinite(yearNum) || yearNum < 2000 || yearNum > currentYear + 10) {
            setError(`Year must be between 2000 and ${currentYear + 10}`);
            return;
        }

        if (!Number.isFinite(tempNum) || tempNum < -20 || tempNum > 55) {
            setError("Temperature must be between -20°C and 55°C");
            return;
        }

        if (!Number.isFinite(pesticidesNum) || pesticidesNum < 0) {
            setError("Pesticides must be a positive number");
            return;
        }

        

        setIsLoading(true);
        setError("");

        try{

            const res= await api.post("/crop_yield_predictor",{
                crop:crop,
                year:yearNum,
                temp:tempNum,
                pesticides:pesticidesNum
            });

            setResult(res.data);

        }catch(error:any){
            setError(error.response?.data?.error || "request failed");
            return;
        }finally{
            setIsLoading(false);
        }
    }


    return (
        <div>
            <h2>crop yeild predictor</h2>

            <form onSubmit={handleSubmit}>

                <div>
                    <label>crop</label>
                    <select 
                        value={crop} 
                        onChange={(e) => setCrop(e.target.value)}
                    >
                    <option value="">Select a crop</option>
                        {CROPS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label>year</label>
                    <input
                        type="number" value={year} placeholder="2026"
                        min={2000} max={new Date().getFullYear() + 10}
                        step={1} onChange={(e) => setYear(e.target.value)}
                    />
                </div>

                <div>
                    <label>temperature(C)</label>
                    <input
                        type="number" value={temp} placeholder="27"
                        min={-20} max={55} step={0.1}
                        onChange={(e) => setTemp(e.target.value)}
                    />
                </div>

                <div>
                    <label>pesticides_tonnes</label>
                    <input
                        type="number" value={pesticides} placeholder="100"
                        min={0} step={0.01}
                        onChange={(e) => setPesticides(e.target.value)}
                    />
                </div>

                <div>
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? "sending request":"submit"}
                    </button>
                </div>

            </form>
            
            {error && <p style={{ color: "red" }}>{error}</p>}

            {result && (
            <div>
                <h3>Prediction Result</h3>
                <p>Predicted yield: <strong>{result.predicted_yield_kg_per_ha} kg/ha</strong></p>
                <p>Confidence range: {result.confidence_low} — {result.confidence_high} kg/ha</p>
            </div>
            )}
            
        </div>
    )

};

export default CropYieldPredictorPage ;

