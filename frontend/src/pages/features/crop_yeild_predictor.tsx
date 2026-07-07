import  {useState} from "react"

const CropYieldPredictorPage=()=>{

    const CROPS= ['Cassava', 'Maize', 'Plantains and others', 'Potatoes',
         'Rice, paddy', 'Sorghum', 'Soybeans', 'Sweet potatoes']

    const [crop, setCrop]= useState("");

    return (
        <div>
            <h2>crop yeild predictor</h2>

            <form>

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
                    <input type="number"></input>
                </div>

                <div>
                    <label>temperature</label>
                    <input type="number"></input>
                </div>

                <div>
                    <label>pesticides_tonnes</label>
                    <input type="number"></input>
                </div>

            </form>
        </div>
    )

};

export default CropYieldPredictorPage ;

