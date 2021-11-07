import './App.css';
import React, {useState} from 'react'
import {useForm} from "react-hook-form";
import Amplify, {API} from 'aws-amplify'
import 'bootstrap/dist/css/bootstrap.min.css';
import {Button, Col, Container, Modal, ModalBody, ModalFooter, ModalHeader, Row} from 'reactstrap';

Amplify.configure({
    aws_appsync_region: "eu-west-1", // Stack region
    aws_appsync_graphqlEndpoint: "https://xxx.appsync-api.eu-west-1.amazonaws.com/graphql", // AWS AppSync endpoint
    aws_appsync_authenticationType: "LAMBDA"
});

const listPayments = `query { listPayments  { id, type, amount, from_account, to_account }  }`

function App() {

    const {register, handleSubmit, setValue, formState: {errors}} = useForm();
    const [modal, setModal] = React.useState(false);
    const toggle = () => setModal(!modal);
    const [hasError, setHasError] = useState("");
    const [modalBody, setModalBody] = useState("");

    const onListSubmit = async ({authToken}) => {
        try {
            const res = await API.graphql({query: listPayments, authToken})
            setHasError(false)

            let rows = []
            res.data?.listPayments?.forEach(payment => {
                rows.push( <>
                    <div>Id: {payment.id}</div>
                    <div>From account: {payment.from_account}</div>
                    <div>To account: {payment.to_account}</div>
                    <div>Amount: {payment.amount}</div>
                </>)
            })
            setModalBody(
                <>
                    {rows}
                </>
            );
        } catch (error) {
            setHasError(true)
            setModalBody("Unauthorized to retrieve information");
        }
        toggle();
    }

    const handleClick = async () => {
        const response = await fetch('http://localhost:3001/generate-token')
        const {token} = await response.json()
        setValue("authToken", token);
    }

    const textAreaStyle = {
        width: "30rem",
        height: "18rem"
    };

    const buttonSectionStyle = {
        width: "30rem",
        justifyContent: "space-between",
        display: "flex"
    };

    return (
        <>
            <Container lg="4">
                <Row>
                    <Col xs="3">
                        <form onSubmit={handleSubmit(onListSubmit)}>
                            <textarea
                                style={textAreaStyle}
                                {...register("authToken", {required: true})}
                            />
                            <div>
                                {errors.authToken && <span>This field is required</span>}
                            </div>


                            <section style={buttonSectionStyle}>
                                <Button
                                    className="flex"
                                    color="primary"
                                    onClick={() => handleClick()}
                                >
                                    Generate Token
                                </Button>
                                <Button type="submit" value="Fetch Info" color="info" className="flex">
                                    Fetch Info
                                </Button>
                            </section>

                        </form>
                    </Col>
                </Row>
            </Container>
            <Modal isOpen={modal}
                   toggle={toggle}
            >
                <ModalHeader>
                    {hasError ? 'Something went wrong!' : 'Payment List'}
                </ModalHeader>
                <ModalBody>{modalBody}</ModalBody>
                <ModalFooter>
                    <Button variant="secondary" onClick={toggle}>
                        Close
                    </Button>
                </ModalFooter>
            </Modal>
        </>

    )
}

export default App;
