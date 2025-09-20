import { Link } from "react-router";
import { Trash2, MonitorUp, HardDriveDownload, SquareArrowOutUpRight } from 'lucide-react'
import toast from "react-hot-toast";

const Mp3 = ({ mp3, serverUrl, deleteMp3ButtonClick, setMp3Library, api}) => {
  return (
    <div>
        <div className="card shadow">
            <audio className="mx-auto my-3" controls src={import.meta.env.PROD ? mp3.mp3Path : `${serverUrl}/${mp3.mp3Path}`}></audio>
            <div className="card-body">
                <h5 className="card-title">{mp3.name}</h5>
                <div className="d-grid">
                    <a className="btn btn-outline-primary" data-bs-toggle="collapse" href={`#collapse-mp3-${mp3.id}`} role="button" aria-expanded="false" aria-controls={`collapse-mp3-${mp3.id}`}>
                        See Description
                    </a>
                </div>
                <div className="collapse" id={`collapse-mp3-${mp3.id}`}>
                    <p className="card-text whitespace-break-spaces max-height-50vh overflow-y-auto border rounded  p-3 mt-3">{mp3.description}</p>
                </div>
                <div className="row mt-3">
                    <div className="col-12 col-sm-6 d-grid mb-1">
                        <Link className='btn btn-primary' to={`/mp3/${mp3.id}`} state={{ mp3, serverUrl }}><MonitorUp /> View Mp3</Link>
                    </div>
                    <div className="col-12 col-sm-6 d-grid mb-1">
                        <a href={import.meta.env.PROD ? mp3.mp3Path : `${serverUrl}/${mp3.mp3Path}`} download={""} className='btn btn-success'><HardDriveDownload /> Download</a>
                    </div>
                    <div className="col-12 col-sm-6 d-grid mb-1">
                        <button type='button' onClick={deleteMp3ButtonClick} data-mp3id={mp3.id} className='btn btn-danger'><Trash2 /> Delete</button>
                    </div>
                    <div className="col-12 col-sm-6 d-grid mb-1">
                        <a href={mp3.link} target='_blank' className='btn btn-warning'><SquareArrowOutUpRight /> Original Link</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}
export default Mp3