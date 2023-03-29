import { useEffect } from "react";
import { useParams } from "react-router-dom";

const Profile = (props) => {

    const {id} = useParams();

    useEffect(() => {
        fetch(`${props.serverURL}/profile/${id}`, {
            mode: 'cors'
        })
        .then(res => res.json())
        .then(data => console.log(data))

    }, [])

    return(
        <div>
            <h1>Profile</h1>
        </div>
    )
}
export default Profile;