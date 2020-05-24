import React from 'react';
import './App.css';
import { withAuthorization } from '../Session';

import { Modal,ModalManager,Effect} from 'react-dynamic-modal';
import { PieChart } from 'react-minimal-pie-chart';
import 'react-contexify/dist/ReactContexify.min.css';
import * as firebase from 'firebase'
import { Resizable, ResizableBox } from 'react-resizable';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import backarrow from './backarrow.png';
import darkdeleteicon from './deletedark.svg';
import darkrenameicon from './renamedark.svg';
import whitedeleteicon from './deletewhite.svg';
import whiterenameicon from './renamewhite.svg';
import deviceicon from './rotatedevice.png';
import ReactGA from 'react-ga';
require('@firebase/database');

//DOC: Component: This component renders a single course button in the sidebar that, when clicked, changes the main panel to display that course.
//Input: name, active, changeActiveCourse
//Output: JSXElement
function CourseListItem(props) {
    var code = codeToName(props.name);
    return ( 
        <div className="courselistitem" onClick={() => {props.changeActiveCourse(props.name);}} >
            {code}
        </div>
    );
}

//DOC: Function: This function takes Converts the class code passed into the function into the actual English name of the course
//Input: classcode
//Output: String
function codeToName(classcode) {
	const allCourses = JSON.parse(localStorage.getItem('courses'));
        for (let i = 0, len = allCourses.length; i < len; ++i) {
            var course = allCourses[i];
            if (course.nclasscode === classcode) {
                return course.CourseName;
            }
        }
}

//DOC: Component: Displays a single button in the sidebar, that, when clicked, changes the main panel to allow you to enroll in a course
//Input: addCourseMode
//Output: JSXElement
function AddCourseItem(props) {
    return (
        (!currentUserIsAdmin()) ? 
            (<div className="addcourseitem" onClick={props.addCourseMode}>
                Enroll in a course
            </div>) : (<div />)
    );
}

//DOC: Component: Displays a single button in the sidebar, that, when clicked, changes the main panel to allow you to create a course
//Input: createCourseMode
//Output: JSXElement
function CreateCourseItem(props) {
    return (
        (currentUserIsAdmin()) ? 
            (<div className="addcourseitem" onClick={props.createCourseMode}>
                Create a course
            </div>) : (<div />)
    );
}

//DOC: Function: Determines whether the current user logged in is an Admin, or Teacher, or a student. Returns true if the former, and false if the latter.
//Input: None
//Output: boolean
function currentUserIsAdmin() {
    const usr = JSON.parse(localStorage.getItem('authUser'));
    return (Object.values(usr).slice()[3][0]==="ADMIN");
}

//DOC: Function: Determines whether the user is blocked from the activeCourse
//Input: username, activeCourse
//Output: boolean
function isUserBlocked(username, activeCourse) {
    // return false if the user is blocked from the course, and true if the user is not blocked
    // This should simply be the value in the key-value pair in the database you set up in getListOfStudents()
    const allCourses = JSON.parse(localStorage.getItem('courses'));
    var stulist;
    for (let i = 0, len = allCourses.length; i < len; ++i) {
        var course = allCourses[i];
        if (course.nclasscode === activeCourse) {
            stulist = course.ostudentList; // identifies current course child name to update
            return stulist[username];
        }
    }
    return true; //placeholder to remove
}

//DOC: Component: The entire left sidebar.
//Input: username, activeCourse, arrCourses, changeActiveCourse, addCourseMode, createCourseMode
//Output: JSXElement
class Sidebar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: props.username,
            activeCourse: props.activeCourse,
            arrCourses: props.arrCourses,
        }
    }

    //utility functions to pass info up to container
    changeActiveCourse = (name) => {this.props.changeActiveCourse(name);}
    addCourseMode = () => {this.props.addCourseMode();}
    createCourseMode = () => {this.props.createCourseMode();}

    render() {

        return (
            <div className="sidebar">
                <div className="courselist">
                    <br />
                    <AddCourseItem addCourseMode={this.addCourseMode}/>
                    <CreateCourseItem createCourseMode={this.createCourseMode}/>
                    {(this.props.arrCourses.length<=1) ? (null) : this.props.arrCourses.map(course => ((course==="Welcome" || !isUserBlocked(this.state.username, this.state.activeCourse)) ? (null) : (<CourseListItem name={course} active={(this.props.activeCourse===course ? "active" : "")} changeActiveCourse={this.changeActiveCourse}/>)))}
                </div>
            </div>

        );
    }
}


//DOC: Component: Displays a popup dialog.
//Input: itemName, firebase, text, modules, activeCourse, moduleTitle, internal, vark, onRequestClose, teacherMode, addItemMode (optional)
//Output: JSXElement
class MyModal extends React.Component {     
    constructor(props) {
        super(props);
        this.handleFilter = this.handleFilter.bind(this);
        this.filterCallback = this.filterCallback.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleItemNameChange = this.handleItemNameChange.bind(this);
        this.state = {
            varkselection: (this.props.vark==="V" || this.props.vark==="A" || this.props.vark==="R" || this.props.vark==="K") ? (this.props.vark) : (null),
            value: this.props.internal,
            itemName: (this.props.itemName==="add") ? ("") : (this.props.itemName),
            //modules: this.props.modules.slice(), //modify this.state.modules //push the entirety of this.state.modules up to the database
        };
    }

    handleChange(event) {    this.setState({value: event.target.value});  }
    handleItemNameChange(event) {    this.setState({itemName: event.target.value});  }

    handleSubmit(event) {
        if (!(this.state.varkselection==="V" || this.state.varkselection==="A" || this.state.varkselection==="R" || this.state.varkselection==="K")) {
            alert('You need to select a VARK type!');
            event.preventDefault();
            return;
        }

        if (this.props.addItemMode) {
            const allCourses = JSON.parse(localStorage.getItem('courses'));
            var courseID;
            for (let i = 0, len = allCourses.length; i < len; ++i) {
                var course = allCourses[i];
                if (course.nclasscode === this.props.activeCourse) {
                    courseID = course.appID; // identifies current course child name to update
                    break;
                }
            }
            const arrModules = this.props.modules;
            const curModule = this.props.moduleTitle;
            for ( let i = 0; i < arrModules.length; ++i) {
                var neededModule;
                if ( arrModules[i].title === curModule) {
                    neededModule = arrModules[i]; break; // finds needed module to edit
                }
            }

            const contents = neededModule.contents; // add your new items
            const internals = neededModule.internals;
            const vark = neededModule.vark;

            //double check we don't already have an item with that name
            let iteration;
            for (iteration in contents) {
                if (contents[iteration]===this.state.itemName) {
                    alert('You already have an item with that name!');
                    event.preventDefault();
                    return;
                }
            }

            contents.push(this.state.itemName);
            internals.push(this.state.value);
            vark.push(this.state.varkselection);


            const newPush = this.props.modules;


            this.props.firebase.courses().child(courseID).update({
                modules: newPush.slice(),
            });
        }
        else {
    
            const allCourses = JSON.parse(localStorage.getItem('courses'));
            var courseID;
            for (let i = 0, len = allCourses.length; i < len; ++i) {
                var course = allCourses[i];
                if (course.nclasscode === this.props.activeCourse) {
                    courseID = course.appID; // identifies current course child name to update
                    break;
                }
            }
            const arrModules = this.props.modules;
            const curModule = this.props.moduleTitle;
            for ( let i = 0; i < arrModules.length; ++i) {
                var neededModule;
                if ( arrModules[i].title === curModule) {
                    neededModule = arrModules[i]; break; // finds needed module to edit
                }
            }

            const contents = neededModule.contents;  // modify the corresponding item
            const internals = neededModule.internals;
            const vark = neededModule.vark;
            for ( let i = 0; i < contents.length; ++i) {
                let itemTemp = contents[i];
                if ( itemTemp === this.props.itemName && vark[i] === this.props.vark) {
                    internals[i] = this.state.value;
                }
            }

            const newPush = this.props.modules; // record to database
            

            this.props.firebase.courses().child(courseID).update({
                modules: newPush.slice(),
            });
        }

        ModalManager.close();
        event.preventDefault();
    }

    handleFilter(theState) { //handles selection of the dropdown VARK by the teacher
        this.setState({varkselection: theState}, () => this.filterCallback());
    }

    filterCallback() { //callback from handleFilter
        const allCourses = JSON.parse(localStorage.getItem('courses'));
            var courseID;
            for (let i = 0, len = allCourses.length; i < len; ++i) {
                var course = allCourses[i];
                if (course.nclasscode === this.props.activeCourse) {
                    courseID = course.appID; // identifies current course child name to update
                    break;
                }
            }
            const arrModules = this.props.modules;
            const curModule = this.props.moduleTitle;
            for ( let i = 0; i < arrModules.length; ++i) {
                var neededModule;
                if ( arrModules[i].title === curModule) {
                    neededModule = arrModules[i]; break; // finds needed module to edit
                }
            }

            const contents = neededModule.contents;  // modify the corresponding item
            const vark = neededModule.vark;
            for ( let i = 0; i < contents.length; ++i) {
                let itemTemp = contents[i];
                if ( itemTemp === this.props.itemName) {
                    vark[i] = this.state.varkselection;
                }
            }

            const newPush = this.props.modules; // record to database
            
            this.props.firebase.courses().child(courseID).update({
                modules: newPush.slice(),
            });
        this.render();
    }

    render(){
       const { text,onRequestClose } = this.props;

       var internalDisplay = "";

       var link = this.props.internal;

       if (this.props.teacherMode) {
           if (this.props.addItemMode) {
                internalDisplay = (
                    <div>
                        <center>
                            <br /><br /><br /><br />
                            <h1 style={{color: "#003459"}}>Create an item</h1>
                            <Select passState={this.handleFilter} default={"Choose a VARK type"}/>
                            <br /><br />
                            <form>
                                <label>
                                    <p className="teachernotice">Enter the item name:</p>
                                    <input type="text" value={this.state.itemName} onChange={this.handleItemNameChange} />
                                </label>
                            </form>
                            <br /><br />
                            <form onSubmit={this.handleSubmit}>
                                <label>
                                    <p className="teachernotice">Enter the link to the item:</p>
                                    <input type="text" value={this.state.value} onChange={this.handleChange} />
                                </label>
                                    <br /><br />
                                <input type="submit" value="Submit" />
                            </form>
                        </center>
                    </div>
                );

                return ( //big modal
                    <Modal
                        style= {{
                            overlay: {
                            position        : 'fixed',
                            top             : -150,
                            left            : 0,
                            right           : 0,
                            bottom          : 0,
                            zIndex          : 99999999,
                            overflow        : 'hidden',
                            perspective     :  1300,
                            backgroundColor : 'rgba(0, 0, 0, 0.3)'
                            },

                            content: {
                            position                : 'relative',
                            margin                  : '15% auto',
                            width                   : '80%',
                            height                  : '600px',
                            border                  : '1px solid rgba(0, 0, 0, .2)',
                            background              : '#fff',
                            borderRadius            : '4px',
                            outline                 : 'none',
                            boxShadow               : '0 5px 10px rgba(0, 0, 0, .3)',
                            textAlign               : 'center',
                            overflow                : 'hidden',
                            }
                        }}
                        onRequestClose={onRequestClose}
                        effect={Effect.ScaleUp}
                    >
                        {internalDisplay}
                    </Modal>
                );
           } else {
                internalDisplay = (
                    <div>
                        <center>
                            <h1 style={{fontSize: "xx-large"}}>Edit this item</h1>
                            <Select passState={this.handleFilter} default={"Choose a VARK type"}/>
                            <form onSubmit={this.handleSubmit}>
                                <label>
                                    <p className="teachernotice">Enter the link to the item:</p>
                                    <input type="text" value={this.state.value} onChange={this.handleChange}/></label>
                                    <br /><br />
                                <input type="submit" value="Submit" />
                            </form>
                        </center>
                    </div>
                );

                return ( //small modal
                    <Modal
                        className="modaldialog"
                        onRequestClose={onRequestClose}
                        effect={Effect.ScaleUp}>
                        <h1 className="modaldialog">
                            {internalDisplay}
                        </h1>
                    </Modal>
                );
           }
       }
       else {
            if("VARK".includes(this.props.vark) && link.includes("google")){
                if (link.includes("/edit?usp=sharing")) { //standardize on "view" as the thing to replace, since GDrive is gaey and some view-only links still have edit in the link
                link = link.substring(0, link.indexOf("/edit?usp=sharing")) + "/view?usp=sharing";
                }
                if (link.includes("/view?usp=sharing")) { //if its a google drive shared file
                    link = link.substring(0, link.indexOf("/view?usp=sharing")) + "/preview"; //make it an embeddable preview
                }
                if (link.includes("/viewform")) //if its a google form/quiz
                    link += "?embedded=true";


                        //embed it
                        var beforeCode = "<iframe src=\"";
                        var afterCode = "\" width=\"100%\" height=\"750\" />";
                        var code = beforeCode + link + afterCode;

                        internalDisplay = (<div dangerouslySetInnerHTML={{__html: code}}></div>);

                        return ( //big modal
                            <Modal
                                style= {{
                                    overlay: {
                                    position        : 'fixed',
                                    top             : -200,
                                    left            : 0,
                                    right           : 0,
                                    bottom          : 0,
                                    zIndex          : 99999999,
                                    overflow        : 'hidden',
                                    perspective     :  1300,
                                    backgroundColor : 'rgba(0, 0, 0, 0.3)'
                                    },

                                    content: {
                                    position                : 'relative',
                                    margin                  : '15% auto',
                                    width                   : '90%',
                                    height                  : '770px',
                                    border                  : '1px solid rgba(0, 0, 0, .2)',
                                    background              : '#fff',
                                    borderRadius            : '4px',
                                    outline                 : 'none',
                                    boxShadow               : '0 5px 10px rgba(0, 0, 0, .3)',
                                    textAlign               : 'center',
                                    overflow                : 'hidden',
                                    }
                                }}
                                onRequestClose={onRequestClose}
                                effect={Effect.ScaleUp}
                            >
                                {internalDisplay}
                            </Modal>
                        );
            } else if (link.includes("youtube") || link.includes("youtu.be")) {
                if (link.includes("youtu.be"))
                    link = link.substring(0, link.indexOf("youtu.be")) + "youtube.com/watch?v=" + link.substring(link.indexOf("be/") + 3, link.length);
                if (link.includes("youtube"))
                    link = link.substring(0, link.indexOf("/watch?v=")) + "/embed/" + link.substring(link.indexOf("v=") + 2, link.length);
                var beforeCode = "<iframe width=\"1000\" height=\"500\" src=\"";
                var afterCode = "\" frameBorder=\"0\"\n" +
                    "allow=\"accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture\"\n" +
                    "allowFullScreen></iframe>";
                var code = beforeCode + link + afterCode;

                internalDisplay = (<div dangerouslySetInnerHTML={{__html: code}}></div>);

                return ( //small modal
                    <Modal
                        style= {{
                            overlay: {
                            position        : 'fixed',
                            top             : -150,
                            left            : 0,
                            right           : 0,
                            bottom          : 0,
                            zIndex          : 99999999,
                            overflow        : 'hidden',
                            perspective     :  1300,
                            backgroundColor : 'rgba(0, 0, 0, 0.3)'
                            },

                            content: {
                            position                : 'relative',
                            margin                  : '15% auto',
                            width                   : '90%',
                            height                  : '600px',
                            border                  : '1px solid rgba(0, 0, 0, .2)',
                            background              : '#fff',
                            borderRadius            : '4px',
                            outline                 : 'none',
                            boxShadow               : '0 5px 10px rgba(0, 0, 0, .3)',
                            textAlign               : 'center',
                            overflow                : 'hidden',
                            }
                        }}
                        onRequestClose={onRequestClose}
                        effect={Effect.ScaleUp}
                    >
                        <br /><br />
                        {internalDisplay}
                    </Modal>
                );

            }
            else { //just create a button and insert the link as the button's destination
                var beforeCode = "<a class=\"linkbutton\" target=\"_blank\" href=\"";
                var afterCode = "\">Click here to open content in new tab</a>";
                var code = beforeCode + link + afterCode;

                internalDisplay = (<div dangerouslySetInnerHTML={{__html: code}}></div>);

                return ( //small modal
                    <Modal
                        className="modaldialog"
                        onRequestClose={onRequestClose}
                        effect={Effect.ScaleUp}>
                        <h1 className="modaldialog">
                            <table style={{maxHeight: "50px"}}>
                                <tr>
                                    <td>
                                        <button id="backbutton" onClick={ModalManager.close}><img src={backarrow} alt="Return" height="15px"/></button>
                                    </td>
                                    <td>
                                        {internalDisplay}
                                    </td>
                                </tr>
                            </table>
                        </h1>
                    </Modal>
                );
            }
        }
    }
}

//DOC: Component: Inline button that, when clicked, allows the user to rename a module.
//Input: internal, moduleTitle, modules, firebase, activeCourse
//Output: JSXElement
class RenameModule extends React.Component {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.clearField = this.clearField.bind(this);
        this.state = {
            value: this.props.internal,
            active: false,
            newVal: "Enter new module name",
        };
    }

    clearField() {
        if (this.state.newVal==="Enter new module name") {
            this.setState({
                newVal: "",
            });
        }
    }

    onClick() {
        this.setState({
            active: true,
        });
    }

    handleChange(event) {    this.setState({newVal: event.target.value});  }

    handleSubmit(event) {
        this.setState({
            value: this.state.newVal,
            active: false,
        });

        // this will rename the current module
        const allCourses = JSON.parse(localStorage.getItem('courses'));
        var courseID;
        for (let i = 0, len = allCourses.length; i < len; ++i) {
            var course = allCourses[i];
            if (course.nclasscode === this.props.activeCourse) {
                courseID = course.appID; // identifies current course child name to update
                break;
            }
        }
        const arrModules = this.props.modules;

        //check if we already have a module with that name
        let iteration;
        for (iteration in arrModules) {
            if (arrModules[iteration].title===this.state.newVal) {
                alert('You already have a module with that name!');
                return;
            }
        }

        const curModule = this.props.moduleTitle;
        for ( let i = 0; i < arrModules.length; ++i) {
            if ( arrModules[i].title === curModule) {
                arrModules[i].title = this.state.newVal; // sets the new name
            }
        }
        const newPush = this.props.modules; // push to firebase
        this.props.firebase.courses().child(courseID).update({
            modules: newPush.slice(),
        });

        event.preventDefault();
    }

    render() {
        var inside = (
            <p className="renamebutton">
                <img src={whiterenameicon} height="15px"/>              
            </p>
        );
        if (this.state.active) {
            inside = (
            <form onSubmit={this.handleSubmit}>
                <label>
                    <input className="internal" type="text" value={this.state.newVal} onChange={this.handleChange} onClick={this.clearField}/>
                </label>
                <input className="internal" type="submit" value="Submit" />
            </form>
            );
        }

        return (
            <div className="renameitem" onClick={() => this.onClick()}>
                {inside}
            </div>
        );
    }
}

//DOC: Component: Inline button that, when clicked, allows the user to delete a module.
//Input: internal, moduleTitle, modules, firebase, activeCourse
//Output: JSXElement
class DeleteModule extends React.Component {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.state = {
            value: this.props.internal,
            active: false,
            newVal: this.props.internal,
        };
    }

    onClick() {
        this.setState({
            active: true,
        });
    }

    handleChange(event) {    this.setState({newVal: event.target.value});  }

    handleSubmit(event) {
        this.setState({
            value: this.state.newVal,
            active: false,
        });

        // this will rename the current module
        const allCourses = JSON.parse(localStorage.getItem('courses'));
        var courseID;
        for (let i = 0, len = allCourses.length; i < len; ++i) {
            var course = allCourses[i];
            if (course.nclasscode === this.props.activeCourse) {
                courseID = course.appID; // identifies current course child name to update
                break;
            }
        }
        const arrModules = this.props.modules;

        const curModule = this.props.moduleTitle;
        for ( let i = 0; i < arrModules.length; ++i) {
            if ( arrModules[i].title === curModule) {
                arrModules[i].title = "DELETE THAT YOU HOT DOG"; // sets the new name to delete ot
            }
        }
        const newPush = this.props.modules; // push to firebase
        this.props.firebase.courses().child(courseID).update({
            modules: newPush.slice(),
        });

        event.preventDefault();
    }

    render() {
        var inside = (
            <p className="renamebutton">
                <img src={whitedeleteicon} height="15px"/>              
            </p>
        );
        if (this.state.active) {
            inside = (
            <form onSubmit={this.handleSubmit}>
                <input className="internaldeletion" type="submit" value="Confirm Deletion" />
            </form>
            );
        }

        return (
            <div className="renameitem" onClick={() => this.onClick()}>
                {inside}
            </div>
        );
    }
}

//DOC: Component: Inline button that, when clicked, allows the user to rename an item.
//Input: internal, moduleTitle, activeCourse, modules, itemName, vark, firebase
//Output: JSXElement
class RenameItem extends React.Component {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.clearField = this.clearField.bind(this);
        this.state = {
            value: this.props.internal,
            active: false,
            newVal: "Enter new item name",
        };
    }

    clearField() {
        if (this.state.newVal==="Enter new item name")
            this.setState({newVal: ""});
    }

    onClick() {
        this.setState({
            active: true,
        });
    }

    handleChange(event) {    this.setState({newVal: event.target.value});  }

    handleSubmit(event) {
        this.setState({
            value: this.state.newVal,
            active: false,
        });

        const allCourses = JSON.parse(localStorage.getItem('courses'));
        var courseID;
        for (let i = 0, len = allCourses.length; i < len; ++i) {
            var course = allCourses[i];
            if (course.nclasscode === this.props.activeCourse) {
                courseID = course.appID; // identifies current course child name to update
                break;
            }
        }
        const arrModules = this.props.modules;
        const curModule = this.props.moduleTitle;
        
        for ( let i = 0; i < arrModules.length; ++i) {
            var neededModule2;
            if ( arrModules[i].title === curModule) {
                neededModule2 = arrModules[i]; break; // finds needed module to edit
            }
            else
                console.log("bope");
        }

        const contents = neededModule2.contents;  // renames the corresponding item
        const vark = neededModule2.vark;

        let count = 0;
        for ( let i = 0; i < contents.length; ++i) { //check we're not duplicating item names
            let itemTemp = contents[i];
            //console.log(itemTemp);
            if ( (itemTemp === this.state.newVal) /*&& (vark[i] === this.props.vark)*/) {
                alert('You already have an item with that name!');
                event.preventDefault();
                return;
            }
        }

        for ( let i = 0; i < contents.length; ++i) { //good, actually rename it now
            let itemTemp = contents[i];
            if ( (itemTemp === this.props.itemName) /*&& (vark[i] === this.props.vark)*/) {
                contents[i] = this.state.newVal;
            }
        }

        const newPush = this.props.modules; // record to database
        

        this.props.firebase.courses().child(courseID).update({
            modules: newPush.slice(),
        });

        event.preventDefault();
    }

    render() {
        var inside = (<p className="renamebutton">&nbsp;&nbsp;<img src={darkrenameicon} height="15px"/></p>);
        if (this.state.active) {
            inside = (
            <form onSubmit={this.handleSubmit}>
                <label>
                    <input className="whiteinternal" type="text" value={this.state.newVal} onChange={this.handleChange} onClick={this.clearField}/>
                </label>
                <input className="whiteinternal" type="submit" value="Submit" />
            </form>
            );
        }

        return (
            <div className="renameitem" onClick={() => this.onClick()}>
                {inside}
            </div>
        );
    }
}


//DOC: Component: Inline button that, when clicked, allows the user to delete an item.
//Input: internal, moduleTitle, activeCourse, modules, itemName, vark, firebase
//Output: JSXElement
class DeleteItem extends React.Component {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.state = {
            value: this.props.internal,
            active: false,
            newVal: this.props.internal,
        };
    }

    onClick() {
        this.setState({
            active: true,
        });
    }

    handleChange(event) {    this.setState({newVal: event.target.value});  }

    handleSubmit(event) {
        this.setState({
            value: this.state.newVal,
            active: false,
        });

        const allCourses = JSON.parse(localStorage.getItem('courses'));
        var courseID;
        for (let i = 0, len = allCourses.length; i < len; ++i) {
            var course = allCourses[i];
            if (course.nclasscode === this.props.activeCourse) {
                courseID = course.appID; // identifies current course child name to update
                break;
            }
        }
        const arrModules = this.props.modules;
        const curModule = this.props.moduleTitle;
        
        for ( let i = 0; i < arrModules.length; ++i) {
            var neededModule2;
            if ( arrModules[i].title === curModule) {
                neededModule2 = arrModules[i]; break; // finds needed module to edit
            }
            else
                console.log("bope");
        }

        const contents = neededModule2.contents;  // renames the corresponding item
        const vark = neededModule2.vark;

        for ( let i = 0; i < contents.length; ++i) { //good, actually rename it now
            let itemTemp = contents[i];
            if ( (itemTemp === this.props.itemName) /*&& (vark[i] === this.props.vark)*/) {
                contents[i] = "DELETE THAT YOU HOT DOG";
            }
        }

        const newPush = this.props.modules; // record to database
       

        this.props.firebase.courses().child(courseID).update({
            modules: newPush.slice(),
        });

        event.preventDefault();
    }

    render() {
        var inside = (<p className="renamebutton">&nbsp;&nbsp;<img src={darkdeleteicon} height="15px"/></p>);
        if (this.state.active) {
            inside = (
            <form onSubmit={this.handleSubmit}>
                <input className="whiteinternaldeletion" type="submit" value="Confirm Deletion" />
            </form>
            );
        }

        return (
            <div className="renameitem" onClick={() => this.onClick()}>
                {inside}
            </div>
        );
    }
}

//DOC: Component: A course item, that, when clicked, displays one of the course contents.
//Input: name, vark, internal, addVarkClicks, teacherMode, moduleTitle, activeCourse, modules, firebase
//Output: JSXElement
class ModuleContentItem extends React.Component {
    constructor(props) {
        super(props);
        this.openModal = this.openModal.bind(this);
    }

    openModal() { //this registers the click
        if (this.props.varkStatus) {
            this.props.addVarkClicks(this.props.vark);
        }
        if (this.props.instantOpen) {
            window.open(this.props.internal, '_blank');
        }
        else {
            const header = this.props.name;
            ModalManager.open(<MyModal itemName={this.props.name} firebase={this.props.firebase} text={header} modules={this.props.modules} activeCourse={this.props.activeCourse} moduleTitle={this.props.moduleTitle} internal={this.props.internal} vark={this.props.vark} onRequestClose={() => true} teacherMode={this.props.teacherMode} />);
        }
    }

    render() {
        let precede = this.props.vark;
        var attribute = precede+"modulecontentitem"

        var teacherMode = this.props.teacherMode;
        var renameDisplay = (
            <RenameItem
                internal={this.props.name}
                moduleTitle={this.props.moduleTitle}
                activeCourse={this.props.activeCourse}
                modules={this.props.modules}
                vark={this.props.vark}
                itemName={this.props.name}
                firebase={this.props.firebase}
            />
        );
        var deleteDisplay = (
            <DeleteItem
                internal={this.props.name}
                moduleTitle={this.props.moduleTitle}
                activeCourse={this.props.activeCourse}
                modules={this.props.modules}
                vark={this.props.vark}
                itemName={this.props.name}
                firebase={this.props.firebase}
            />
        );


        var datacells = (
            <div className={attribute} onClick={() => this.openModal()}>
                {this.props.name}
            </div>
        );
        if (teacherMode) {
            datacells = (
                <div className={attribute} >
                    <div className="editflex" >
                        <div className="editflextext" onClick={() => this.openModal()}>
                            {this.props.name}
                        </div>
                        <div className="editflexicon">
                            {deleteDisplay}
                            &nbsp;&nbsp;&nbsp;
                            {renameDisplay}
                        </div>
                    </div>
                    
                </div>
            );
        }

        return (
            <div>
                {datacells}
            </div>
        );
    }
}

//DOC: Component: A button that allows the user (assumedly a teacher) to add an item to the module.
//Input: moduleTitle, activeCourse, modules, firebase
//Output: JSXElement
class AddModuleContentItemItem extends React.Component {
    constructor(props) {
        super(props);
        this.openModal = this.openModal.bind(this);
    }

    openModal() { //this registers the click
        ModalManager.open(<MyModal itemName="add" firebase={this.props.firebase} moduleTitle={this.props.moduleTitle} activeCourse={this.props.activeCourse} modules={this.props.modules} onRequestClose={() => true} teacherMode={true} addItemMode={true}/>);
    }

    render() {
        var attribute = "addmodulecontentitem";

        var inner = (<div>Add an item</div>);

        return (
            <div className={attribute} onClick={() => this.openModal()}>
                {inner}
            </div>
        );
    }
}

//DOC: Component: A button that allows the user (assumedly a teacher) to add a module to the course.
//Input: internal, activeCourse, modules, firebase, changeActiveCourse
//Output: JSXElement
class AddModuleItem extends React.Component {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.clearField = this.clearField.bind(this);
        this.state = {
            value: this.props.internal,
            active: false,
            newVal: "Enter Module Name",
        };
    }

    clearField() {
        if (this.state.newVal==="Enter Module Name") {
            this.setState({
                newVal: "",
            });
        }
    }

    onClick() {
        this.setState({
            active: true,
        });
    }

    handleChange(event) {    this.setState({newVal: event.target.value});  }

    handleSubmit(event) {
        event.preventDefault();

        const allCourses = JSON.parse(localStorage.getItem('courses'));
        var courseID;
        for (let i = 0, len = allCourses.length; i < len; ++i) {
            var course = allCourses[i];
            if (course.nclasscode === this.props.activeCourse) {
                courseID = course.appID; // identifies current course child name to update, courseID != classcode
                break;
            }
        }
        const arrModules = this.props.modules;
        const moduleTitle = this.state.newVal;

        //check if we already have a module with that name
        let iteration;
        for (iteration in arrModules) {
            if (arrModules[iteration].title===moduleTitle) {
                alert('You already have a module with that name!');
                return;
            }
        }
        
        const blankModule =  
        {
            title: moduleTitle,
            contents: ["Example Item",],
            vark: ['A',],
            internals: ["https://youtu.be/uWJtJYXtTKo",]
        } // creates example blank module using module title

        arrModules.push(blankModule);
            
        const newPush = arrModules.slice();

        this.props.firebase.courses().child(courseID).update({
            modules: newPush.slice(),
        });
    }
    
    render() {
        var inside = 
        // (this.state.active) ?
        (
            <div>
                <form onSubmit={this.handleSubmit}>
                    <label>
                        <input className="internal" type="text" value={this.state.newVal} onChange={this.handleChange} onClick={this.clearField}/>
                    </label>
                    <input className="internaladd" type="submit" value="Add a Module" />
                </form>
                
            </div>
        ) 
        // : (<p className="addrenamebutton">Add a Module</p>);

        return (
            <div className="addmoduleitem">
                <div className="renameitem" onClick={() => this.onClick()}>
                    {inside}
                </div>
            </div>
        );
    }
}

//DOC: Component: Displays an entire module, including all of its content items.
//Input: name, contents, vark, internals, active, username, addVarkClicks, varkMode, teacherMode, activeCourse, modules, firebase, showVark
//Output: JSXElement
function ModuleItem(props) {
    const [active, setActive] = React.useState(props.active);

    var attribute = active+"moduleitem";

    var teacherMode = props.teacherMode;

    if (teacherMode) {
        attribute+="teacher";
    }

    var addCourseItemItem = (<div />);
    if (teacherMode) {
        addCourseItemItem = (
            <AddModuleContentItemItem
                moduleTitle={props.name}
                activeCourse={props.activeCourse}
                modules={props.modules}
                firebase={props.firebase}
            />
        );
    }

    var renameDisplay = (<div />);
    if (teacherMode) {
        renameDisplay = (
            <RenameModule
                internal={props.name}
                moduleTitle={props.name}
                activeCourse={props.activeCourse}
                modules={props.modules}
                firebase = {props.firebase}
            />
        );
    }

    var deleteDisplay = (<div />);
    if (teacherMode) {
        deleteDisplay = (
            <DeleteModule
                internal={props.name}
                moduleTitle={props.name}
                activeCourse={props.activeCourse}
                modules={props.modules}
                firebase = {props.firebase}
            />
        );
    }

    var topbar = (
        <div className="moduletitle" onClick={() => setActive(active==="active" ? "" : "active")}>
            {props.name}
        </div>
    );
    if (teacherMode) {
        topbar = (
            // <div className="teachermoduletitle" >
            //     <div className="editflex">
            //         <div className="editflextext" onClick={() => setActive(active==="active" ? "" : "active")}>
            //             {props.name}
            //         </div>
            //         <div className="editflexicon">
            //             {deleteDisplay}
            //             &nbsp;&nbsp;&nbsp;
            //             {renameDisplay} 
            //         </div>
            //     </div>
            // </div>

            <div className="titlemodulecontentitem" >
                <div className="editflex" >
                    <div className="editflextext" onClick={() => setActive(active==="active" ? "" : "active")}>
                        {props.name}
                    </div>
                    <div className="editflexicon">
                        {deleteDisplay}
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        {renameDisplay}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className={attribute} >
                {topbar}
                <div className="modulecontents">
                    {(active==="active") ? (props.contents.map(
                        contentitem =>
                        (props.varkMode==="All" || props.varkMode===props.vark[props.contents.indexOf(contentitem)])
                        ?
                        (
                            (contentitem!=="DELETE THAT YOU HOT DOG") ?
                            (<ModuleContentItem
                                varkStatus={props.varkStatus}
                                instantOpen={props.instantOpen}
                                name={contentitem}
                                vark={(props.showVark) ? (props.vark[props.contents.indexOf(contentitem)]) : ("")}
                                internal={props.internals[props.contents.indexOf(contentitem)]}
                                addVarkClicks={props.addVarkClicks}
                                teacherMode={props.teacherMode}
                                moduleTitle={props.name}
                                activeCourse={props.activeCourse}
                                modules={props.modules}
                                firebase={props.firebase}
                            />) : (null)
                        )
                        :
                        (<div />)
                    )) : (null)}
                    {(active==="active") ? (addCourseItemItem) : (null)}
                </div>
            </div>
        </div>
    );
}

//DOC: Component: Displays the entire VARK Profile.
//Input: Vcnt, Acnt, Rcnt, Kcnt
//Output: JSXElement
function VarkProfile(props) {
    const lineWidth = 60;
    return (
        <div className="varkprofile">
            <PieChart
                style={{
                    fontFamily:
                    '"Nunito Sans", -apple-system, Helvetica, Arial, sans-serif',
                    fontSize: '8px',
                    height: "150px",
                }}
                data={[
                    {
                        color: 'red',
                        title: 'V',
                        value: props.Vcnt,
                    },
                    {
                        color: 'blue',
                        title: 'A',
                        value: props.Acnt,
                    },
                    {
                        color: 'green',
                        title: 'R',
                        value: props.Rcnt,
                    },
                    {
                        color: 'purple',
                        title: 'K',
                        value: props.Kcnt,
                    },
                ]}
                radius={PieChart.defaultProps.radius - 6}
                lineWidth={60}
                segmentsStyle={{ transition: 'stroke .3s', cursor: 'pointer' }}
                animate
                label={({ dataEntry }) => Math.round(dataEntry.percentage) + '%'}
                labelPosition={100 - lineWidth / 2}
                labelStyle={{
                    fill: '#fff',
                    opacity: 0.75,
                    pointerEvents: 'none',
                }}
            />
        </div>
    );
}

//DOC: Component: Allows the user to filter which VARK-type of items to display.
//Input: passState, default
//Output: JSXElement
class Select extends React.PureComponent {
    constructor(props) {
        super(props);
    }

    state = {
      options: [
        {
            name: this.props.default,
            value: "All",
        },
        {
            name: 'Visual',
            value: 'V',
        },
        {
            name: 'Auditory',
            value: 'A',
        },
        {
            name: 'Reading/Writing',
            value: 'R',
        },
        {
            name: 'Kinesthetic',
            value: 'K',
        },
      ],
      value: '?',
    };

    handleChange = (event) => {
      this.props.passState(event.target.value);
      this.setState({ value: event.target.value });
    };

    render() {
      const { options, value } = this.state;

      return (
          <div className="varkfilter">
            <React.Fragment>
                <select name="search_categories" id="search_categories" onChange={this.handleChange} value={value}>
                    {options.map(item => (
                    <option className="option" key={item.value} value={item.value}>
                        &nbsp;&nbsp;&nbsp;{item.name}
                    </option>
                    ))}
                </select>
            </React.Fragment>
          </div>
      );
    }
}

//DOC: Component: The entire right half of the screen, which can change its display depending on whether we want to show the contents of the course, with all the modules; or the screen that lets us enroll in a course; or the screen that lets us create a course.
//Input: firebase, username, activeCourse, modules, removeCourse, addVarkClicks
//Output: JSXElement
class MainPanel extends React.Component {
    constructor (props){
        super(props);
        
        this.handleRemove = this.handleRemove.bind(this);
        this.handleFilter = this.handleFilter.bind(this);
        this.filterCallback = this.filterCallback.bind(this);
        this.getCurrentUserEmail = this.getCurrentUserEmail.bind(this);
        this.getTeacherEmail = this.getTeacherEmail.bind(this);
        this.getTeacherName = this.getTeacherName.bind(this);
        this.codeToName = this.codeToName.bind(this);
        this.isVarkEnabled = this.isVarkEnabled.bind(this);

        this.state = {
            varkselection: "All",
            copied: false,
            showVark: this.isVarkEnabled(),
        };
    }

    handleRemove(event) {
        this.props.removeCourse(this.props.activeCourse);
    }

    handleFilter(theState) {
        this.setState({varkselection: theState}, () => this.filterCallback());
    }

    filterCallback() {
        this.render();
    }

    getTeacherEmail(nameOfCourse) { // use code here instead
        const allCourses = JSON.parse(localStorage.getItem('courses'));
        var teacher;
        for (let i = 0, len = allCourses.length; i < len; ++i) {
            var course = allCourses[i];
            if (course.nclasscode === nameOfCourse) {
                teacher = course.nteacher;
            }
        }
        // should be returning correct email. If not, try Object.values(course.nteacher) instead
        return teacher;
    }

    getTeacherName(teacherEmail) {
        const allCourses = JSON.parse(localStorage.getItem('courses'));
        for (let i = 0, len = allCourses.length; i < len; ++i) {
            var course = allCourses[i];
            if (course.nclasscode === this.props.activeCourse) {
                return course.nteacherName;
            }
        }
        return "Example Teacher Name";
    }

    getCurrentUserEmail() {
        const usr = JSON.parse(localStorage.getItem('authUser'));
        const curEmail = Object.values(usr).slice()[1]; // returns string of current user's email
        return curEmail;
    }

    codeToName(code) {
        const allCourses = JSON.parse(localStorage.getItem('courses'));
        for (let i = 0, len = allCourses.length; i < len; ++i) {
            var course = allCourses[i];
            if (course.nclasscode === code) {
                return course.CourseName;
            }
        }
    }

    getListOfStudents() {
        // This will return the list of students emails
        const allCourses = JSON.parse(localStorage.getItem('courses'));
        var stulist;
        for (let i = 0, len = allCourses.length; i < len; ++i) {
            var course = allCourses[i];
            if (course.nclasscode === this.props.activeCourse) {
                stulist = course.ostudentList; // identifies current course child name to update
                break;
            }
        }
        var stukeys = [];
        if ( stulist != undefined) {
            for (let [key, value] of Object.entries(stulist)) {
                if (key !== "exampleStudentEmail") {
                    key = key.replace(/EMAILDOT/g, ".");
                    stukeys.push(key);
                }
            }
        }
        console.log(stukeys);
        return stukeys; 
    }

    getListOfStudentKicks() {
        
        // This function needs to return an array of all the values (all the true/false strings)
        const allCourses = JSON.parse(localStorage.getItem('courses'));
        var stulist;
        for (let i = 0, len = allCourses.length; i < len; ++i) {
            var course = allCourses[i];
            if (course.nclasscode === this.props.activeCourse) {
                stulist = course.ostudentList; // identifies current course child name to update
                break;
            }
        }
        var stu = [];
        if ( stulist != undefined) {
            for (let [key, value] of Object.entries(stulist)) {
                if (key !== "exampleStudentEmail")
                    stu.push(JSON.stringify(value));
                    console.log(stu);
            }
        }
        
        return stu; 
    }

    setStudentKick(studentEmail, kickStatus) { //kickStatus is a string, studentEmail is a string
        studentEmail = studentEmail.replace(/\./g,'EMAILDOT');
        // Continuation of the in getListOfStudents:
        // This function needs to set the kickStatus(value) of the studentEmail(key) to what's been passed into this function
        const allCourses = JSON.parse(localStorage.getItem('courses'));
        var stulist;
        var courseID;
        for (let i = 0, len = allCourses.length; i < len; ++i) {
            var course = allCourses[i];
            if (course.nclasscode === this.props.activeCourse) {
                stulist = course.ostudentList; // identifies current course child name to update
                courseID = course.appID;
                break;
            }
        }
        if ( stulist != undefined) {
            for (let key in stulist) {
                console.log(JSON.stringify(key).replace(/\"/, ''))
                if (JSON.stringify(key).replace(/\"/g, '') == studentEmail){ 
                    console.log(1);
                    var newkick;
                    if (kickStatus === "false") 
                        newkick = false;
                    else
                        newkick = true;
                    stulist[studentEmail] = newkick;
                    console.log(stulist);
                    this.props.firebase.courses().child(courseID).update({
                        ostudentList: stulist,
                    });
                }
            }
        }
    }

    isVarkEnabled() {
        const allCourses = JSON.parse(localStorage.getItem('courses'));
        for (let i = 0, len = allCourses.length; i < len; ++i) {
            var course = allCourses[i];
            if (course.nclasscode === this.props.activeCourse) {
                return course.varkEnabled;
            }
        }
    }

    onChangeCheckbox(varkStatus) {
        // changes whether the course shows VARK or no
        const allCourses = JSON.parse(localStorage.getItem('courses'));
        var courseID;
        for (let i = 0, len = allCourses.length; i < len; ++i) {
            var course = allCourses[i];
            if (course.nclasscode === this.props.activeCourse) {
                courseID = course.appID; // identifies current course child name to update
                break;
            }
        }
        this.props.firebase.courses().child(courseID).update({
            varkEnabled: varkStatus,
        });

        //this.setState({ [event.target.name]: event.target.checked }); //Keep this line of code
    };

    render() { //active: "" means the module is minimized, "active" means its expanded
        var showModules = true;
        var showVarkProfile = true;

        var varkStatus = this.isVarkEnabled();

        var courseid = (this.props.activeCourse);

        var teacherMode = this.getTeacherEmail(this.props.activeCourse)===this.getCurrentUserEmail();

        var welcomeMsg;
        var unenroll;
        var joinCode;
        var filter;
        var teacherReveal;
        var showRest = true;
        var teacherEmail = this.getTeacherEmail(this.props.activeCourse);
        if (this.props.activeCourse==="none") {
            welcomeMsg = "No course selected.";
            teacherReveal = "";
            joinCode = (
                <div />
            );
            unenroll = (
                <div />
            );
            showVarkProfile = false;
            filter = (
                <div />
            );
            showRest = false;
        }
        else {
            welcomeMsg = "Welcome to " + this.codeToName(this.props.activeCourse); //CodeToName
            let teachermsg = "Taught by " + this.getTeacherName(this.getTeacherEmail(this.props.activeCourse));
            teacherReveal = teachermsg;
            unenroll = (
                <div className="managecontent">
                    <br />
                    <h3>
                        Unenroll from this course
                    </h3>
                    <center>
                        <div className="removecoursebutton" onClick={this.handleRemove}>
                            Unenroll
                        </div>
                    </center>
                    <br /><br />
                </div>
            );
            filter = (varkStatus) ? (<Select passState={this.handleFilter} default={"Show all VARK types"}/>) : (null);
            if (teacherMode) {
                joinCode = (
                    <div className="teachernotice">
                        <p><b>Join Course ID:&nbsp;&nbsp;&nbsp;</b> {courseid}</p>
                    </div>
                );
                unenroll = (
                    <div />
                );
            }
            if (welcomeMsg === "Welcome to Welcome") {
                welcomeMsg = "Select or add a course on the left to get started."
                showModules = false;
                unenroll = (
                    <div />
                );
                joinCode = (
                    <div />
                );
                showVarkProfile = false;
                showRest = false;
            }
        }

        var addModuleItem = (<div />);
        if (teacherMode) {
            addModuleItem = (
                <AddModuleItem
                    internal=""
                    activeCourse={this.props.activeCourse}
                    modules={this.props.modules}
                    firebase={this.props.firebase}
                    changeActiveCourse={this.props.changeActiveCourse}
                />
            );
        }

        var viewModuleList = (<div />);
        var editModuleList = (<div />);
        if (showModules) {
            viewModuleList = (
                <div className="modulelist">
                    {
                        Object.values(this.props.modules).map(module =>
                            (module.title!=="DELETE THAT YOU HOT DOG") ? 
                            (<ModuleItem
                                varkStatus={varkStatus}
                                instantOpen={this.props.instantOpen}
                                name={module.title}
                                contents={module.contents}
                                vark={module.vark}
                                internals={module.internals}
                                active=""
                                username={this.props.username}
                                addVarkClicks={this.props.addVarkClicks}
                                varkMode={this.state.varkselection}
                                teacherMode={false}
                                activeCourse={this.props.activeCourse}
                                modules={this.props.modules}
                                firebase={this.props.firebase}
                                showVark={varkStatus}
                            />) : (null)
                        )
                    }
                </div>
            );
            editModuleList = (
                <div className="modulelist">
                    {
                        Object.values(this.props.modules).map(module =>
                            (module.title!=="DELETE THAT YOU HOT DOG") ? 
                            (<ModuleItem
                                varkStatus={varkStatus}
                                instantOpen={this.props.instantOpen}
                                name={module.title}
                                contents={module.contents}
                                vark={module.vark}
                                internals={module.internals}
                                active=""
                                username={this.props.username}
                                addVarkClicks={this.props.addVarkClicks}
                                varkMode={this.state.varkselection}
                                teacherMode={true}
                                activeCourse={this.props.activeCourse}
                                modules={this.props.modules}
                                firebase={this.props.firebase}
                                showVark={varkStatus}
                            />) : (null)
                        )
                    }
                    {addModuleItem}
                </div>
            );
        }

        //counts the number of each vark item in modules
        var Vcnt = 0;
        var Acnt = 0;
        var Rcnt = 0;
        var Kcnt = 0;
        var module;
        var varkLetter;
        for (module of this.props.modules) {
            for (varkLetter of module.vark) {
                if (varkLetter==="V") {
                    Vcnt++;
                }
                if (varkLetter==="A") {
                    Acnt++;
                }
                if (varkLetter==="R") {
                    Rcnt++;
                }
                if (varkLetter==="K") {
                    Kcnt++;
                }
            }
        }

        var varkProfile = (<div />);
        if (showVarkProfile) {
            varkProfile = (
                <VarkProfile
                    Vcnt={Vcnt}
                    Acnt={Acnt}
                    Rcnt={Rcnt}
                    Kcnt={Kcnt}
                />
            );
        }

        var mailtostring = "mailto:" + teacherEmail;

        var contactTeacher = (teacherMode) ? (null) : (
            <div className="managecontent">
                <center>
                    <br />
                    <h3>
                        {teacherReveal} 
                    </h3>
                    <p className="smallparagraph">
                        {teacherEmail}<br /><br />
                    </p>
                    <a className="smalllinkbutton" href={mailtostring}>Contact</a>
                    <br /><br />
                </center>
            </div>
        );

        var joinClassCode = (teacherMode) ? (
            <div className="managecontent">
                <center>
                    <br />
                    <h3>
                        Course Join Code
                    </h3>
                    <p className="smallparagraph">
                        {this.props.activeCourse}<br /><br />
                    </p>
                    <CopyToClipboard text={this.props.activeCourse} onCopy={() => this.setState({copied: true})}>
                        <a className="smalllinkbutton">{(this.state.copied) ? ("Copied!") : ("Copy to Clipboard")}</a>
                    </CopyToClipboard>
                    <br /><br />
                </center>
            </div>
        ) : (null);

        var listOfStudents = this.getListOfStudents();
        var listOfStudentKicks = this.getListOfStudentKicks();

        var manageStudents = (teacherMode) ? (
            <div className="managecontent">
                <center>
                    <br /><br />
                    <h3>Manage Students</h3>
                    <p className="smallparagraph">By default, all enrolled students can view your course.<br />
                    You can block individuals by flipping their switch off.</p><br />
                </center>
                {(listOfStudents.length<=1) ? (
                    <p className="smallparagraph">You don't have any students yet.</p>
                ) : listOfStudents.map(
                    student => (student===this.props.email) ? (null) : (
                        (listOfStudentKicks[listOfStudents.indexOf(student)]==="false") ? (
                            <div className="studentrow">
                                <label className="switch">
                                    <input
                                        name="studentswitch"
                                        type="checkbox"
                                        checked={false}
                                        onChange={() => this.setStudentKick(student, "true")}
                                    />
                                    <span class="slider round"></span>
                                </label>
                                <p className="studentsmallparagraph">{student}</p>
                            </div>
                        ) : (
                            <div className="studentrow">
                                <label className="switch">
                                    <input
                                        name="studentswitch"
                                        type="checkbox"
                                        checked={true}
                                        onChange={() => this.setStudentKick(student, "false")}
                                    />
                                    <span class="slider round"></span>
                                </label>
                                <p className="studentsmallparagraph">{student}</p>
                            </div>
                        )
                    )
                )}
                <br /><br /><br />
            </div>
        ) : (null);

        var ModulesTab = (teacherMode) ? (<Tab><p className="tabtext">View Modules</p></Tab>) : (<Tab><p className="tabtext">Modules</p></Tab>);
        var EditModulesTab = (teacherMode) ? (<Tab><p className="tabtext">Edit Modules</p></Tab>) : (null);
        var OtherTab = (teacherMode) ? (<Tab><p className="tabtext">Manage Course</p></Tab>) : (<Tab><p className="tabtext">Other</p></Tab>);
        
        var ViewModulesPanel = (
            <TabPanel>
                {filter}
                {viewModuleList}
            </TabPanel>
        );
        var EditModulesPanel = (teacherMode) ? (
            <TabPanel>
                {filter}
                {editModuleList}
            </TabPanel>
        ) : (null);

        var varkContent = null;
        if (varkStatus && teacherMode) {
            varkContent = (
                <div className="managecontent">
                    <center>
                        <h3><br /> <br />Course VARK Profile</h3> 
                        <div>
                            <p>VARK is <b>Enabled</b></p>
                            <label className="switch">
                                <input
                                    name="showVark"
                                    type="checkbox"
                                    checked={varkStatus}
                                    onChange={(event) => this.onChangeCheckbox(event.target.checked)}
                                />
                                <span class="slider round"></span>
                            </label>
                            <br /><br /><br />
                            <hr />
                        </div>
                        <br /><br />
                        <table className="offsetleft">
                            <tr>
                                <td>
                                    {varkProfile}
                                </td>
                                <td>
                                    <p className="smallparagraph" style={{color: "red"}}>Visual</p>
                                    <p className="smallparagraph" style={{color: "blue"}}>Auditory</p>
                                    <p className="smallparagraph" style={{color: "green"}}>Reading/Writing</p>
                                    <p className="smallparagraph" style={{color: "purple"}}>Kinesthetic</p>
                                </td>
                            </tr>
                        </table>
                        <br /><br /><br />
                    </center>
                </div>
            );
        } else if (!varkStatus && teacherMode) {
            varkContent = (
                <div className="managecontent">
                    <center>
                        <h3><br /> <br />Course VARK Profile</h3> 
                        <div>
                            <p>VARK is <b>Disabled</b></p>
                        </div>
                        <label className="switch">
                            <input
                                name="showVark"
                                type="checkbox"
                                checked={varkStatus}
                                onChange={(event) => this.onChangeCheckbox(event.target.checked)}
                            />
                            <span class="slider round"></span>
                        </label>
                        
                        <br /><br /><br /><br />
                    </center>
                </div>
            );
        } else if (varkStatus && !teacherMode) {
            varkContent = (
                <div className="managecontent">
                    <center>
                        <h3><br /> <br />Course VARK Profile</h3> 
                        <br /><br />
                        <table className="offsetleft">
                            <tr>
                                <td>
                                    {varkProfile}
                                </td>
                                <td>
                                    <p className="smallparagraph" style={{color: "red"}}>Visual</p>
                                    <p className="smallparagraph" style={{color: "blue"}}>Auditory</p>
                                    <p className="smallparagraph" style={{color: "green"}}>Reading/Writing</p>
                                    <p className="smallparagraph" style={{color: "purple"}}>Kinesthetic</p>
                                </td>
                            </tr>
                        </table>
                        <br /><br /><br />
                    </center>
                </div>
            );
        } else if (!varkStatus && !teacherMode) {
            varkContent = null;
        }

        var ManagePanel = (
            <TabPanel>
                {joinClassCode}
                {contactTeacher}
                <br />
                {varkContent}
                <br />
                {manageStudents}
                {unenroll}
                <br /><br /><br /><br /><br />
            </TabPanel>
        );

        var restOfPage = (showRest) ? (
            <Tabs>
                <TabList>
                    {ModulesTab}
                    {EditModulesTab}
                    {OtherTab}
                </TabList>
                {ViewModulesPanel}
                {EditModulesPanel}
                {ManagePanel}
            </Tabs>
        ) : (<div />);

        let atmainpanel = (this.props.isMobile==="medium") ? ("mobile-mainpanel") : ("mainpanel");
        let atcourseheader = (this.props.isMobile==="medium") ? ("mobile-courseheader") : ("courseheader");

        return (
            <div className={atmainpanel}>
                <h1 className={atcourseheader}>
                    {welcomeMsg}
                </h1>
                
                {restOfPage}
                <br /> <br /> <br /> <br /> <br /> <br /> <br /> <br /> <br /> <br /> <br /> <br /> <br /> <br /> <br />
            </div>
        )
    }
}

//DOC: Component: The form that allows you to create a class.
//Input: username, courses, createCourse
//Output: JSXElement
class CreateForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {value: ''};
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {    
        let newString = event.target.value.substring(0, 20);
        this.setState({value: newString});  
    }

    handleSubmit(event) {
        this.props.createCourse(this.state.value);
        event.preventDefault();
    }

    render() {
        let charCount = 20-this.state.value.length;

        return (
            <form onSubmit={this.handleSubmit}>
                <label>
                    Enter the name for your new course below<br /><br />
                    <input type="text" value={this.state.value} onChange={this.handleChange} />
                </label>
                <p className="reallysmallparagraph">{charCount} characters remaining</p>
                <br /><br />
                <input type="submit" value="Submit" />
                <br />
                
            </form>
        );
    }
}

//DOC: Component: The form that allows you to enroll in a class.
//Input: username, courses, addCourse
//Output: JSXElement
class NameForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {value: ''};
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {    this.setState({value: event.target.value});  }

    handleSubmit(event) { //plugs into the backend to add the course, and passes the function on up for the main container to do the re-rendering
        let shouldAddCourse = false;

        //check that the course is available on the database. If not, throw an error to the user
        const allCourses = JSON.parse(localStorage.getItem('courses'));
        var needed;
        for (let i = 0, len = allCourses.length; i < len; ++i) {
            var course = allCourses[i];
            if (course.nclasscode === this.state.value) {
                shouldAddCourse = true;
                needed = course.nclasscode;
            }
        }

        if (shouldAddCourse) {
            this.props.addCourse(needed);
        } else {
            alert('Sorry, class not found');
        }
        event.preventDefault();
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <label>
                    Enter the course code below<br /><br />
                    <input type="text" value={this.state.value} onChange={this.handleChange} /></label>
                <br /><br />
                <input type="submit" value="Submit" />
            </form>
        );
    }
}

//DOC: Component: The mainpanel view that allows you to create a class.
//Input: username, currentCourses, createCourse
//Output: JSXElement
function CreateCoursePanel(props) {
    return (
        <div className="mainpanel">
            <div className="addcourseview">
                <div className="addcoursetitle">
                    <b>Create a course</b>
                </div>
                <CreateForm username={props.username} courses={props.courses} createCourse={props.createCourse}/>
            </div>
        </div>
    );
}

//DOC: Component: The mainpanel view that allows you to add a class.
//Input: username, currentCourses, addCourse
//Output: JSXElement
function AddCoursePanel(props) {
    return (
        <div className="mainpanel">
            <div className="addcourseview">
                <div className="addcoursetitle">
                    <b>Enroll in a course</b>
                </div>
                <NameForm username={props.username} courses={props.courses} addCourse={props.addCourse}/>
            </div>
        </div>
    );
}

//DOC: Component: The main container for everything on the screen, that also stores most global data in its state.
//Input: name, firebase, varkClicks, courses
//Output: JSXElement
class Container extends React.Component { 
    constructor(props) {
        super(props);

        //bind the state setting functions to the current class
        this.changeActiveCourse = this.changeActiveCourse.bind(this);
        this.addCourseMode = this.addCourseMode.bind(this);
        this.createCourseMode = this.createCourseMode.bind(this);
        this.toggleHidden = this.toggleHidden.bind(this);

        this.state = {
            arrCourses: props.courses,
            activeCourse: "none", //to be updated with the current open course code
            username: props.name,
            mainPanelMode: 0, //0 means modules view (default), 1 means add-course view, 2 means create-course view
            varkClicks: props.varkClicks,
            hidden: false,
        }
    }

    changeActiveCourse(courseCode) {
        this.setState({
            mainPanelMode: 0,
            activeCourse: courseCode,
        }, () => {
            this.render();
        });

        //window.location = window.location.href.substring(0, window.location.href.indexOf("#")) + '#' + courseCode;
    }

    addCourseMode() { //switches main panel view to addCourseMode
        this.setState({
            mainPanelMode: 1
        });
        this.render(); //force React to rerender
    }

    createCourseMode() { //switches main panel view to createCourseMode
        this.setState({
            mainPanelMode: 2
        });
        this.render(); //force React to rerender
    }

    addCourse = (courseCode) => { //actually adds the course
        var newCourses = this.state.arrCourses.slice();
        if (newCourses.includes(courseCode)) {
            alert("You've already enrolled in this course!");
        }
        else {
            newCourses.push(courseCode);
            this.setState({
                arrCourses: newCourses.slice(),
            }, () => {this.changeActiveCourse(courseCode);});
            const usr = JSON.parse(localStorage.getItem('authUser'));
           
            localStorage.setItem('authUser', JSON.stringify(usr));
           
            this.props.firebase.users().child(Object.values(usr).slice()[0]).update({
                courses: newCourses.slice(),
            });
            // adds user to teacher's view
            const allCourses = JSON.parse(localStorage.getItem('courses'));
            var courseID;
            for (let i = 0, len = allCourses.length; i < len; ++i) {
                var course = allCourses[i];
                var stuemails;
                if (course.nclasscode === courseCode) {
                    courseID = course.appID; // identifies current course child name to update
                    stuemails = course.ostudentList;
                    const newemail = Object.values(usr).slice()[1].replace(/\./g,'EMAILDOT');
                    stuemails[newemail] = true;
                    this.props.firebase.courses().child(courseID).update({
                        ostudentList: stuemails,
                    });
                    break;
                }
            }

        }
    }

    createCourse = (nameOfCourse) => { //actually adds the course
        // alert("Created " + nameOfCourse);
        // generate classcode, make the course with nameOfCourse, add it to the db
        // use getModules(nameOfCourse) to get arbitrary items
        const usr = JSON.parse(localStorage.getItem('authUser'));
        const email = Object.values(usr).slice()[1].toString();
        const username = Object.values(usr).slice()[4];
        var hash1 = 0;
        var hash2 = 0;
        for (let i = 0; i < email.length; i++) {
            const char = email.charCodeAt(i);
            hash1 = ((hash1 << 5) - hash1) + char;
            hash1 = hash1 & hash1;
        }
        for (let i = 0; i < nameOfCourse.length; i++) {
            const char = nameOfCourse.charCodeAt(i);
            hash2 = ((hash2 << 5) - hash2) + char;
            hash2 = hash2 & hash2;
        }
        const rand = Math.round(Math.random()*10000);
        var classCode = hash1 + "" + hash2 + rand; // <-- set this to the class code

        const modulesT = this.getModules(-1);
        const tempName = username + nameOfCourse + classCode;
        const tempStudents = {
            "exampleStudentEmail": true,
        }
        this.props.firebase.course(tempName).update({
            CourseName: nameOfCourse,
            modules: modulesT,
            nclasscode: classCode,
            nteacher: email,
            nteacherName: username,
            ostudentList: tempStudents,
            varkEnabled: true,
        })

        //done for you: at the end, enroll the person in their own course by calling this.addCourse(classCode);
        this.addCourse(classCode);
    }

    addVarkClicks = (varkCharacter) => {
        var newVark = this.state.varkClicks.slice();
        newVark.push(varkCharacter);
        this.setState({
            varkClicks: newVark.slice(),
        });
        const usr = JSON.parse(localStorage.getItem('authUser'));
        
        localStorage.setItem('authUser', JSON.stringify(usr));
        
        this.props.firebase.users().child(Object.values(usr).slice()[0]).update({
            wvarkclicks: newVark.slice(),
        });
    }

    removeCourse = (courseCode) => {
        var newCourses = this.state.arrCourses.slice();
        var newnewCourses = [];
        newCourses.forEach(element => {
            if (!(element===courseCode)) {
                newnewCourses.push(element);
            }
        });
        newCourses = newnewCourses.slice();
        this.setState({
            arrCourses: newCourses.slice(),
        }, () => {this.changeActiveCourse(this.state.arrCourses.slice()[0]);});
        const usr = JSON.parse(localStorage.getItem('authUser'));
    
        localStorage.setItem('authUser', JSON.stringify(usr));
        
        this.props.firebase.users().child(Object.values(usr).slice()[0]).update({
            courses: newCourses.slice(),
        });

        window.location.reload();
        window.location.reload(); 
    }

    getModules(name) {
        if (name===-1) {
            return [
                {
                    title: "Example Module",
                    contents: ["Example Item",],
                    vark: ['V',],
                    internals: ["https://youtu.be/e3RbWSfhlp4",]
                },
            ];
        }
        const allCourses = JSON.parse(localStorage.getItem('courses')); // here is a parsed json of the course list
        if ( name === "none")
            return []

        for (let i = 0, len = allCourses.length; i < len; ++i) {
            var course = allCourses[i];


            if ( course.nclasscode === name) { //now we've retrieved the correct course to display
                //here we need to return all of the modules in that course in an array

                var arrayOfModules = (Object.values(course.modules));
                for (let j = 0, len2 = arrayOfModules.length; j<len2; ++j) {
                    arrayOfModules[j].contents = (Object.values(arrayOfModules[j].contents));
                    arrayOfModules[j].vark = (Object.values(arrayOfModules[j].vark));
                    arrayOfModules[j].internals = (Object.values(arrayOfModules[j].internals));
                }
                return arrayOfModules;

                // we need to convert the objects so that every internal thing is an array, as well as the whole thing, like this [
                //     {
                //         title: course.CourseName,
                //         contents: ["Item 1", "Item 2", "Item 3"],
                //         vark: ['V', "A", "R"],
                //         internals: ["https://www.youtube.com/watch?v=2qv_vCHZkcg&t=1689s", "oogwayascends.mp3", "In the beginning, there was darkness."]
                //     },
                //     {
                //         title: course.CourseName,
                //         contents: ["Item 1", "Item 2", "Item 3"],
                //         vark: ['V', "A", "R"],
                //         internals: ["https://www.youtube.com/watch?v=2qv_vCHZkcg&t=1689s", "oogwayascends.mp3", "In the beginning, there was darkness."]
                //     },
                // ];
            }
            else{
                console.log("whoops");
            }
        }
    }

    toggleHidden() {
        this.setState({
            hidden: !this.state.hidden,
        });
    }

    render() {
        var instantOpen = false;
        if (this.props.isMobile==="small") {
            return (
                <div>
                    <center>
                        <br /><br /><br /><br />
                        <img src={deviceicon} width="100px" />
                        <br /><br />
                        <h3>Please rotate your device to landscape</h3>
                        <br /><br /><br /><br />
                    </center>
                </div>
            );
        } else if (this.props.isMobile==="medium") {
            instantOpen = true;
        }

        var mainpanel;
        if (this.state.mainPanelMode===0) {
            mainpanel = <MainPanel instantOpen={instantOpen} isMobile={this.props.isMobile} firebase={this.props.firebase} username={this.state.username} email={this.props.email} activeCourse={this.state.activeCourse} modules={this.getModules(this.state.activeCourse)} removeCourse={this.removeCourse} addVarkClicks={this.addVarkClicks}/>
        } else if (this.state.mainPanelMode===1) {
            mainpanel = <AddCoursePanel username={this.state.username} currentCourses={this.state.arrCourses} addCourse={this.addCourse}/>
        } else if (this.state.mainPanelMode===2) {
            mainpanel = <CreateCoursePanel username={this.state.username} currentCourses={this.state.arrCourses} createCourse={this.createCourse}/>
        }

        var leftelementattribute = (!(this.props.isMobile==="medium")) ? ("left-element") : ("mobile-left-element");
        var leftelement = (<div />);
        if (!this.state.hidden) {
            leftelement=(
                <div className={leftelementattribute}>
                    <ResizableBox width={300} height={0} axis={'x'} resizeHandles={['ne']}
                    minConstraints={[150, 0]} maxConstraints={[400, 0]} />
                    <Sidebar
                        username={this.state.username}
                        activeCourse={this.state.activeCourse}
                        arrCourses={this.state.arrCourses}
                        changeActiveCourse={this.changeActiveCourse}
                        addCourseMode={this.addCourseMode}
                        createCourseMode={this.createCourseMode}
                    />
                </div>
            );
        }

        var button = (this.state.hidden) ? (
            <button className={(!(this.props.isMobile==="medium")) ? ("smallsidebartoggle") : ("mobile-smallsidebartoggle")} onClick={this.toggleHidden}>
                <img className={("flipimage")} src={backarrow} width="12px"/> 
            </button>
        ) : (
            <button className={(!(this.props.isMobile==="medium")) ? ("sidebartoggle") : ("mobile-sidebartoggle")} onClick={this.toggleHidden}>
                <img className={("")} src={backarrow} width="12px"/> 
            </button>
        );

        var rightelement;
        if (this.props.isMobile==="medium") {
            if (this.state.hidden) {
                rightelement = (
                    <div className="right-element">
                        {mainpanel}
                    </div>
                );
            } else {
                rightelement = (null);
            }
        } else {
            rightelement = (
                <div className="right-element">
                    {mainpanel}
                </div>
            );
        }

        return (
            <div className="App">
                <div className="container">
                    {leftelement}
                    {button}
                    {rightelement}
                </div>
            </div>
        );
    }
}

//DOC: Component: Renders and returns a Container, and initializes it with proper defaults.
//Input: firebase
//Output: JSXElement
class Home extends React.Component {
    constructor(props) {
        super(props);
        const usr = JSON.parse(localStorage.getItem('authUser'));
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
        this.state = {
            username: Object.values(usr).slice()[4],
            email: Object.values(usr).slice()[1],
            courses: Object.values(usr).slice()[2],
            varkClicks: Object.values(usr).slice()[6],
            isMobile: "large", //either large, medium or small
        }
    }

    componentDidMount() {
        //update window size
        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);

        //pull data from firebase
        const usr = JSON.parse(localStorage.getItem('authUser'));
        this.props.firebase.courses().on('value', snapshot => {
            const coursesObject = snapshot.val();
            const coursesList = Object.keys(coursesObject).map(key => ({
                ...coursesObject[key],
                appID: key,
            }));
            localStorage.setItem('courses', JSON.stringify(coursesList));
           
            this.setState({
                username: Object.values(usr).slice()[4],
                email: Object.values(usr).slice()[1],
                courses: Object.values(usr).slice()[2],

            });
        });

        //initialize google analytics
        ReactGA.initialize('UA-167407187-1');
    }
      
    componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDimensions);
    }
    
    updateWindowDimensions() {
        if (window.innerWidth<480) {
            this.setState({ isMobile: "small" },
            () => this.render());
        }
        else if (window.innerWidth<1100) {
            this.setState({ isMobile: "medium" },
            () => this.render());
        }
        else {
            this.setState({ isMobile: "large" },
            () => this.render());
        }
    }

    render() {
        return ( //when login is implemented, it should create an app with the appropriate username passed in
            <Container name={this.state.username} email={this.state.email} courses={this.state.courses} firebase={this.props.firebase} varkClicks={this.state.varkClicks} isMobile={this.state.isMobile}/>
        );
    }
}


const condition = authUser => !!authUser;

export default withAuthorization(condition)(Home);