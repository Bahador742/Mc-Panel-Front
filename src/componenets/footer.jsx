import { useContext } from "react";
import baseURL from "../contexts/baseURL";

const Footer = () => {

    const { DownloadP,filename} = useContext(baseURL)

    return ( <>
        <footer>
           {DownloadP !== '' ? `Downloading ${filename} : ${DownloadP}%` : '2025 MC Panel'}
        </footer>
    </> );
}
 
export default Footer;