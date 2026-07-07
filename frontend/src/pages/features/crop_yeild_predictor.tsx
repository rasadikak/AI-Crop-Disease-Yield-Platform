import  {useState} from "react"

const CropYieldPredictorPage=()=>{

    const CROPS= ['Cassava', 'Maize', 'Plantains and others', 'Potatoes',
         'Rice, paddy', 'Sorghum', 'Soybeans', 'Sweet potatoes']

    const [crop, setCrop]= useState("");
    const [year, setYear]= useState("");
    const [temp, setTemp]= useState("");
    const [pesticides, setPesticides]= useState("");

    const [isLoading, setIsLoading]= useState(false);
    const [error, setError]= useState("");

    const handleSubmit= async(e:React.FormEvent)=>{
        e.preventDefault();

        if(!crop || !year || !temp || !pesticides){
            setError("All fields are required");
            return;
        }

        setIsLoading(true);
        setError("");

        try{

        }catch(error:any){
            setError(error.response?.data?.error || "signup failed");
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
                    <input type="number" value={year} placeholder="2026" onChange={(e)=>{setYear(e.target.value)}}></input>
                </div>

                <div>
                    <label>temperature(C)</label>
                    <input type="number" placeholder="27" value={temp} onChange={(e)=>{setTemp(e.target.value)}}></input>
                </div>

                <div>
                    <label>pesticides_tonnes</label>
                    <input type="number" value={pesticides} placeholder="100" onChange={(e)=>{setPesticides(e.target.value)}}></input>
                </div>

                <div>
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? "sending request":"submit"}
                    </button>
                </div>

            </form>

            <div className="result">

            </div>
        </div>
    )

};

export default CropYieldPredictorPage ;

