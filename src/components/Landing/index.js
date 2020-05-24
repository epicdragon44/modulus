import React from 'react';
import './landingstyle.css';
import AnchorLink from 'react-anchor-link-smooth-scroll'
import { Link } from 'react-router-dom';
import AboutUs from "./AboutUs";
import * as ROUTES from "../../constants/routes";
const linkstyle = {
    fontSize: 20,
    color: 'white',
};
const Landing = () => (
    <div>

             <section id='header'>
                <div className="parallax1">
                    <div className="text-block1">
                        <h1 className="header">Modulus</h1>
                        <p className="header2">Where Learning Happens</p>
                        <Link className="Button2" to={ROUTES.SIGN_UP}>Sign Up Now &raquo;</Link>
                        <AnchorLink style={linkstyle} href='#info'>Click for more information &raquo;</AnchorLink>
                    </div>
                </div>
            </section>
            <section id='info'>
                <div className="parallax2"></div>
                <div className="text-block2">
                    <AnchorLink style={linkstyle} href='#header'>&laquo; Top</AnchorLink>
                    <h2 className="topper1"><b>Our Product</b></h2>
                    <p>Modulus is an online education platform, similar in concept to Canvas or Blackboard, both of which are used by schools and universities around the nation. But unlike existing platforms, Modulus directly integrates the VARK learning styles - a psychological framework for teaching - into an incredibly simple to use, modular course structure that anyone can use to teach anything. The result is a fairer, more accessible, and more equitable online education for everyone.</p>
                    <h2 className="topper2"><b>Our Mission</b></h2>
                    <p>In light of the recent COVID-19 crisis, we’ve seen staggering demand for online courses as students grapple with a reality in which education is now delivered over the internet. But traditional e-learning platforms like Khanacademy struggle to keep up with the pace of demand, while LMS platforms like Canvas, which requires teachers to sign up as part of large, wealthy organizations such as school districts, are difficult to use and lock out small independent teachers that just want to continue teaching. And on top of all that, all platforms rely solely on one medium of teaching, such as Udemy through videos, and Edmodo through text, without regard for user learning preferences.
                    </p>
                    <h2 className="topper3"><b>Our User Experience</b></h2>
                    <p>Enrolling in courses is as easy as typing the name of the course into a field, and each course has the same layout: tasks, color coded by their teaching style, grouped into lists we call “Modules.” There’s no complicated embedded forms, hard-to-navigate buttons, tabbed menus, or other user interface disasters, and the whole interface has been built from the ground up to be fast, responsive, and intuitive.
                    </p>
                    <p style={{margin: 30}}></p>
                    <AnchorLink style={linkstyle} href='#research'>Research &raquo;</AnchorLink>
                </div>
            </section>
            <section id='research'>
                <div className="parallax3"></div>
                <div className="text-block3">
                    <AnchorLink style={linkstyle} href='#info'>&laquo; Description</AnchorLink>
                    <h2 className="Research">Research</h2>
                    <p className="researchparagraph">The Basis of our Application is backed by Research</p>
                    <p className="researchparagraph">Click to read Research Papers regarding the VARK Model: </p>
                    <button type="submit" className="Button1" onClick={x => window.open("https://www.sciencedirect.com/science/article/pii/S1877042810020926")}>Source 1</button>
                    <button type="submit" className="Button2" onClick={x => window.open("https://doi.org/10.2147/AMEP.S235002")}>Source 2</button>
                    <button type="submit" className="Button3" onClick={x => window.open("https://www.researchgate.net/publication/228652724_Learning_styles_and_online_education/citation/download")}>Source 3</button>
                    <p style={{margin: 130}}></p>
                    <AnchorLink style={linkstyle} href='#aboutus'>About Us &raquo;</AnchorLink>
                </div>
            </section>
            <section id='aboutus'>
                <div className="parallax4"></div>
                <div className="text-block4">
                    <AnchorLink style={linkstyle} href='#research'>&laquo; Research</AnchorLink>
                    <AboutUs />
                </div>
            </section>
    </div>

);
export default Landing;