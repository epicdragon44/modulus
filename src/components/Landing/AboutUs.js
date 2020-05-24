import React from 'react';
import Card from "./Card";
import People from "./People";
import "./styles.css";

function AboutUs () {
    return (
        <div>
            <h1 className="header3">Meet the Developers</h1>
            <Card
                name = {People[0].name}
                img = {People[0].imgURL}
            />
            <Card
                name = {People[1].name}
                img = {People[1].imgURL}
            />
            <Card
                name = {People[2].name}
                img = {People[2].imgURL}
            />
        </div>
    );
}
export default AboutUs;