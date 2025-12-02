import React from 'react';

import NavBar from './NavBar';
import BodyContainer from './BodyContainer';

export default function HomePage(){
    return(
    <>
        <NavBar />
        <BodyContainer>
            <h1>¡Bienvenido!</h1>
        </BodyContainer>
    </>);
}