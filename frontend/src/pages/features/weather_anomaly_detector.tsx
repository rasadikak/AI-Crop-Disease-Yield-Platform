import useAuth from "../../hooks/useAuth";
import { useState , useEffect} from "react";
import api from "../../services/api";

const WeatherAnomalyDetectorPage=()=>{

    
    const { farmer } = useAuth();
    const [district, setDistrict]= useState(farmer?.district);
    const [isLoading, setIsLoading]= useState(false);
    const [error, setError]= useState("");
    const[result, setResult]= useState<any>(null);

    const currentMonth= new Date().getMonth();

    useEffect(()=>{
        if (farmer){
            setDistrict(farmer?.district)
        }
    }, [farmer]);

    if (!district){
            setError("district is required");
            return;
    }

    const handleSubmit=async(e:React.FormEvent)=>{
        e.preventDefault();
        setError("");
        setIsLoading(true);
        setResult(null);

        try {
      
            const res = await api.post("/weather_anomaly/", {
                district:district
            });
            console.log(res);
            setResult(res.data);
            } catch (err: any) {
            console.log("errrrrrrr",err)
            setError(err.response?.data?.error || "weather anomaly detection failed — please try again later");
            } finally {
            setIsLoading(false);
            }
        
    }

    


    

    return (
        <div>
            <h2>WeatherAnomalyDetectorPage</h2>
            <div>
                {currentMonth}
            </div>
            <div>
                {result}
            </div>
        </div>
    )

};

export default WeatherAnomalyDetectorPage ;

