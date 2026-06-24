import {Link} from "react-router-dom";

const DashboardPage=()=>{
    return(
        <div>
            <h2>dashboard</h2>
            <Link to="/chatbot">chatbot</Link>
            <Link to="/profile">profile</Link>
            <Link to="/CropYeildPredictor">Crop Yeild Predictor</Link>
            <Link to="/PlantDiseaseClassifier">Plant Disease Classifier</Link>
            <Link to="/WeatherAnomalyDetector">Weather Anomaly Detector</Link>
        </div>


    );
};

export default DashboardPage;