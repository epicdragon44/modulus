import React from 'react';
import './landingstyle.css';
import AnchorLink from 'react-anchor-link-smooth-scroll'
const Landing = () => (
    <div>
        <body className="noscrollbar">
            <AnchorLink href='#header'>Header</AnchorLink>
            <AnchorLink href='#info'>Info</AnchorLink>
            <AnchorLink href='#research'>Research</AnchorLink>
            <AnchorLink href='#aboutus'>About Us</AnchorLink>

            <section id='header'>
                <div className="parallax1">
                    <div className="text-block">
                        <h1 className="header">Modulus</h1>
                        <p className="header2">Where Learning Happens</p>
                        <AnchorLink href='#info'>Info</AnchorLink>
                    </div>
                </div>
            </section>
            <section id='info'>
                <div className="parallax2"></div>
                <p>This is going to be info about what modulus is, why we made it, and how it works</p>
            </section>
            <section id='research'>
                <div className="parallax3"></div>
                <p>This is going to be the research page</p>
            </section>
            <section id='aboutus'>
                <div className="parallax4"></div>
                <p>This is going to be the about us page</p>
            </section>
        </body>


        {/*<head>*/}
            {/*    <meta charSet="utf-8"/>*/}
            {/*    <title>Landing</title>*/}
            {/*</head>*/}
            {/*<body>*/}
            {/*   < div className="container">*/}
            {/*        <div className="parallax1">*/}
            {/*            <div className="text-block">*/}
            {/*                <h1 className="header">Modulus</h1>*/}
            {/*                <p className="header2">Where Learning Happens</p>*/}
            {/*            </div>*/}
            {/*        </div>*/}

            {/*        /!*<p>*!/*/}
            {/*        /!*    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus pharetra egestas lacinia. Phasellus id tincidunt libero, a fermentum velit. Vivamus et lectus laoreet, maximus sapien id, consequat magna. Etiam hendrerit ipsum non massa aliquet, eu pellentesque metus mattis. Nullam at libero ex. Donec non tortor nisi. Donec aliquet placerat eros. Aenean ullamcorper tortor commodo justo dignissim imperdiet vitae eget eros.*!/*/}

            {/*        /!*    Pellentesque faucibus nunc nisl, eu molestie ex fringilla ac. Etiam commodo vel tortor vitae vestibulum. Suspendisse condimentum molestie mauris, in condimentum eros malesuada ac. Sed dictum augue id tempor porttitor. Vestibulum nec sem accumsan, ultrices urna vel, tempus felis. Aliquam et tortor vehicula, congue sem ac, euismod urna. Morbi facilisis ornare lorem, a luctus nulla mattis at. Duis ullamcorper tristique ex, nec euismod nunc pulvinar ac. Aenean sollicitudin quam eget lorem gravida gravida. Sed vitae semper massa. Mauris in tincidunt nisi, a malesuada dui. Aenean consectetur vestibulum egestas.*!/*/}
            {/*        /!*</p>*!/*/}

            {/*        <div className="parallax2">*/}
            {/*        </div>*/}
            {/*    </div>*/}
            {/*</body>*/}
    </div>

);
export default Landing;