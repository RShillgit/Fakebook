import '../styles/notFound.css';

const NotFound = (props) => {

    return (
        <div className="Page">
            <div className="notFound">
                <div className="notFound-title">
                    <h1>Oops... URL Not Found</h1>
                </div>
                <a href="/">
                    <button>Return Home</button>
                </a>
            </div>
        </div>
    )

}
export default NotFound;