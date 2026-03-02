import { IconAnalyze } from "@tabler/icons-react"
import "./style.css"

function MarkerSensor() {
    return (
        <div>
            <div className="marker-sensor w-8 h-8 flex items-center justify-center">
                <div className="bg-white w-5 h-5 rounded-full flex items-center justify-center">
                    <IconAnalyze className="text-black" size={14} stroke={3} />
                </div>
            </div>
        </div >)

}

export default MarkerSensor
