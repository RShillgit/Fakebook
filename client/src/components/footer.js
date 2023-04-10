import githubMark from '../images/GitHubMark.png';
import '../styles/footer.css';

const Footer = () => {
    return (
        <div className="footer">
            <a href="https://github.com/RShillgit" target="_blank" rel='noreferrer'>
                <img id="githubImg" src={githubMark} alt="Github"/>
            </a>
        </div>
    )
}
export default Footer;