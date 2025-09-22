import { api, useAuthStore } from "../lib/axios";
import { useState } from "react"
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

const Legacy = () => {
    const { accessToken } = useAuthStore();
    const [updateLegacyTablesButtonDisabled, setUpdateLegacyTablesButtonDisabled] = useState(false);
    const [updateVideosTableButtonDisabled, setUpdateVideosTableButtonDisabled] = useState(true);
    const navigate = useNavigate();
    // api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

    async function handleUpdateLegacyTablesClick(e) {
        toast.loading("Tables are being updated.")
        try {
            const results = await api.get('/initialize/updateLegacyTables');
            toast.dismiss();
            toast.success("Tables updated!")
            setUpdateLegacyTablesButtonDisabled(true);
            setUpdateVideosTableButtonDisabled(false);
        } catch (error) {
            toast.dismiss();
            toast.error("Uh-oh! There was an error with the download. ☹")
            console.log(error.message);
        }
    }

    async function handleUpdateVideosMp3sAndThumbnailsClick(e) {
        toast.loading("Tables are being updated.")
        try {
            const videoResults = await api.get('/initialize/updateVideosTable');
            const mp3Results = await api.get('/initialize/updateMp3sTable');
            const thumbnailsResults = await api.get('/initialize/updateThumbnailsTable')
            toast.dismiss();
            toast.success("Tables updated!")
            setUpdateLegacyTablesButtonDisabled(true);
            navigate("/dashboard");
        } catch (error) {
            toast.dismiss();
            toast.error("Uh-oh! There was an error with the download. ☹")
            console.log(error.message);
        }
    }

  return (
    <div className="container">
        <div className="row">
            <div className="col-12">
                <h1>Legacy Application Functions</h1>
            </div>
            <div className="col-12 mt-3">
                <div className="row justify-content-around">
                    <div className="col-12 col-sm">
                        <button className="btn btn-primary" onClick={handleUpdateLegacyTablesClick}>Update Legacy Tables</button>
                    </div>
                    <div className="col-12 col-sm">
                        <button className="btn btn-primary" onClick={handleUpdateVideosMp3sAndThumbnailsClick}>Update Videos, MP3s, & Thumbnails Tables</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}
export default Legacy