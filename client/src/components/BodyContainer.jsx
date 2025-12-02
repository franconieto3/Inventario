import React from 'react';
import "../styles/BodyContainer.css"

export default function BodyContainer({children}){
    return (
        <div className='body-container'>
            {children}
        </div>
    )
}