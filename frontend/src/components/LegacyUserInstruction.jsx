import { api } from "../lib/axios"
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
const LegacyUserInstructions = ({ setLegacyUser }) => {
    const navigate = useNavigate();

    async function handleYesClick(e) {
        try {
            const results = await api.post('/initialize/setLegacyAppUser', { legacyAppUser: 1 });
            toast.success('Legacy App User set! Taking you to the next step! 🚀')
            setLegacyUser(true);
            navigate('/legacy');
        } catch (error) {
            console.log(error);
            toast.error("Uh oh! There was an error! 😭")
        }
    }

    async function handleNoClick(e) {
        try {
            const results = await api.post('/initialize/setLegacyAppUser', { legacyAppUser: 0 });
            toast.success('Legacy App User set! Thank you!')
            setLegacyUser(false);
        } catch (error) {
            console.log(error);
            toast.error("Uh oh! There was an error! 😭")
        }
    }

    return (
        <div className="card text-center mt-5">
            <div className="card-body">
                <h5 className="card-title">Are you a legacy user?</h5>
                <div className="row justify-content-center">
                    <div className="col-auto">
                        <button className="btn btn-primary" onClick={handleYesClick}>Yes</button>
                    </div>
                    <div className="col-auto">
                        <button className="btn btn-primary" onClick={handleNoClick}>No</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default LegacyUserInstructions