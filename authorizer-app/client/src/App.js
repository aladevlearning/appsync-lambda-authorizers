import './App.css';
import {useForm} from "react-hook-form";
import Amplify, {API} from 'aws-amplify'
import {useState} from "react";

Amplify.configure({
    aws_appsync_region: "eu-west-1", // Stack region
    aws_appsync_graphqlEndpoint: "https://a3rp45fybfex3jowx5xzas5xqi.appsync-api.eu-west-1.amazonaws.com/graphql", // AWS AppSync endpoint
    aws_appsync_authenticationType: "LAMBDA"
});

const listPayments = `query { listPayments  { id }  }`

function App() {

    const {register, handleSubmit, formState: {errors}} = useForm();

    const [authToken, setToken] = useState();

    const onListSubmit = async ({authToken}) => {
        try {
            const res = await API.graphql({query: listPayments, authToken})
            alert(JSON.stringify(res));
        } catch (error) {
            alert(JSON.stringify(error));
        }
    }

    const handleClick = async () => {
        const response = await fetch('http://localhost:3001/generate-token')
        const {token} = await response.json()
        setToken(token);
    }

    const textAreaStyle = {
        width: "24rem",
        height: "13rem"
    };

    return (
        <>
            <button onClick={() => handleClick()}>Generate Token</button>
            <form onSubmit={handleSubmit(onListSubmit)}>

                <textarea
                    style={textAreaStyle}
                    {...register("authToken", {required: true})}
                />
                <div>
                    {errors.authToken && <span>This field is required</span>}
                </div>


                <input type="submit" value="List"/>
            </form>
        </>

    )
}

export default App;
