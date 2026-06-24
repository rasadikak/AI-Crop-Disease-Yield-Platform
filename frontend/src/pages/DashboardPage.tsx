import {Link} from "react-router-dom";

const DashboardPage=()=>{
    return(
        <div>
            <h2>dashboard</h2>
            <Link to="/chatbot">chatbot</Link>
            <br></br>
            <Link to="/profile">profile</Link>
            <br></br>
            <Link to="/CropYeildPredictor">Crop Yeild Predictor</Link>
            <br></br>
            <Link to="/PlantDiseaseClassifier">Plant Disease Classifier</Link>
            <br></br>
            <Link to="/WeatherAnomalyDetector">Weather Anomaly Detector</Link>
        </div>


    );
};

export default DashboardPage;