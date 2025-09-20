import { useState, useCallback } from "react"
import { debounce } from "../lib/debounce";

const SearchBar = ({ videoLibrary, setVideoLibrary, mp3Library, setMp3Library, api, loadLibrary }) => {
    const [searchTerm, setSearchTerm] = useState("");

    const fetchVideos = useCallback(async (term) => {
        if (!term.trim()) {
            await loadLibrary();
            return;
        }

        try {
            const videoResponse = await api.post('/videos/search', {searchTerm: term});
            const mp3Response = await api.post('/mp3s/search', {searchTerm: term});
            setVideoLibrary(videoResponse.data.reverse())
            setMp3Library(mp3Response.data.reverse());
        } catch (error) {
            console.log("There was an error")
            console.error(error);
        }
    }, [])

    const debouncedFetchVideos = useCallback(debounce(fetchVideos, 300), [fetchVideos])

    function handleFormChange(e) {
        setSearchTerm(e.target.value);
        debouncedFetchVideos(e.target.value)

    }

    return (
        <div className="row my-3 justify-content-center">
            <div className="col-12 col-sm-10">
                <label htmlFor="search" className="form-label">Search for Videos and MP3s</label>
                <input type="text" className="form-control" name="search" id="search" placeholder="Search..." onChange={handleFormChange} value={searchTerm} />
            </div>
        </div>
    )
}
export default SearchBar