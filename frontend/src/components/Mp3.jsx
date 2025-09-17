import { Link } from "react-router";
const Mp3 = ({ mp3, serverUrl, setMp3Library}) => {
    async function deleteMp3ButtonClick(e) {
        const mp3Id = parseInt(e.target.dataset.mp3id);

        try {
            const deleteResults = await api.delete(`/mp3s/${mp3Id}`);
            toast.success('Mp3 deleted')
            setMp3Library(mp3Library.filter(mp3 => mp3.id !== mp3Id));
        } catch (error) {
            console.log(error);
            toast.error("There was an error deleting the MP3")
        }
    }
  return (
    <div>
        <h4>{mp3.name}</h4>
        <div>
            <audio controls src={import.meta.env.PROD ? mp3.mp3Path : `${serverUrl}/${mp3.mp3Path}`}></audio>
        </div>
        <div>
            <button type='button' onClick={deleteMp3ButtonClick} data-mp3id={mp3.id}>Delete</button>
            <button type="button" className='ml-3'>
                <a href={import.meta.env.PROD ? mp3.mp3Path : `${serverUrl}/${mp3.mp3Path}`} download={""}>Download</a>
            </button>
            <Link className='ml-3' to={`/mp3/${mp3.id}`} state={{ mp3, serverUrl }}>View MP3</Link>
        </div>
    </div>
  )
}
export default Mp3