import React from 'react';
import './App.css';
import { withAuthorization } from '../Session';

import { Modal,ModalManager,Effect} from 'react-dynamic-modal';
import { PieChart } from 'react-minimal-pie-chart';
import 'react-contexify/dist/ReactContexify.min.css';
import * as firebase from 'firebase'
import backarrow from './backarrow.png';
require('@firebase/database');

function CourseListItem(props) {
    return (
        <div className="courselistitem" onClick={() => {props.changeActiveCourse(props.name);}} >
            {props.name}
        </div>
    );
}

function AddCourseItem(props) {
    return (
        <div>
            <br />
            <div className="addcourseitem" onClick={props.addCourseMode}>
                Enroll in a course
            </div>
            <br />
        </div>
    );
}

function CreateCourseItem(props) {
    return (
        <div>
            <br />
            <div className="addcourseitem" onClick={props.createCourseMode}>
                Create a course
            </div>
            <br />
        </div>
    );
}

class Sidebar extends React.Component { //the entire left sidebar
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
            <div>
                <div className="sidebar">
                    <center>
                        <table width="90%">
                            <tr>
                                <td>
                                    <AddCourseItem addCourseMode={this.addCourseMode}/>
                                </td>
                                <td>
                                    <CreateCourseItem createCourseMode={this.createCourseMode}/>
                                </td>
                            </tr>
                        </table>
                    </center>
                    <div className="courselist">
                        {(this.props.arrCourses.length<=1) ? (<p className="dividertext">You're not enrolled in any courses yet.<br/>Enroll or teach using the buttons above.</p>) : this.props.arrCourses.map(course => ((course==="Welcome") ? (<div />) : (<CourseListItem name={course} active={(this.props.activeCourse===course ? "active" : "")} changeActiveCourse={this.changeActiveCourse}/>)))}
                    </div>
                </div>
            </div>
            
        );
    }
}

class MyModal extends React.Component{
    constructor(props) {
        super(props);
        this.handleFilter = this.handleFilter.bind(this);
        this.filterCallback = this.filterCallback.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleItemNameChange = this.handleItemNameChange.bind(this);
        this.state = {
            varkselection: null,
            value: this.props.internal,
            itemName: "",
            //modules: this.props.modules.slice(), //modify this.state.modules //push the entirety of this.state.modules up to the database
        };
    }

    handleChange(event) {    this.setState({value: event.target.value});  }
    handleItemNameChange(event) {    this.setState({itemName: event.target.value});  }

    handleSubmit(event) { 
        if (this.props.addItemMode) {
            const allCourses = JSON.parse(localStorage.getItem('courses'));
            var courseID;
            for (let i = 0, len = allCourses.length; i < len; ++i) {
                var course = allCourses[i];
                if (course.CourseName === this.props.activeCourse) {
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
                if (course.CourseName === this.props.activeCourse) {
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
            console.log(newPush);
            
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
                if (course.CourseName === this.props.activeCourse) {
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
            console.log(newPush);
            
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
                            width                   : '60%',
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
                                <br /><br />
                                <form onSubmit={this.handleSubmit}>
                                    <label>
                                        <p className="teachernotice">Enter the link to the item:</p>
                                        <input type="text" value={this.state.value} onChange={this.handleChange} /></label>
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
            }   else { //just create a button and insert the link as the button's destination
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

 class RenameModule extends React.Component {
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
        });

        alert(this.state.newVal);
        // this will rename the current module
        const allCourses = JSON.parse(localStorage.getItem('courses'));
        var courseID;
        for (let i = 0, len = allCourses.length; i < len; ++i) {
            var course = allCourses[i];
            if (course.CourseName === this.props.activeCourse) {
                courseID = course.appID; // identifies current course child name to update
                break;
            }
        }
        const arrModules = this.props.modules;
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
        var inside = (<p className="renamebutton">[Rename]</p>);
        if (this.state.active) {
            inside = (
                <form onSubmit={this.handleSubmit}>
                <label>
                    <input type="text" value={this.state.newVal} onChange={this.handleChange} />
                </label>
                <input type="submit" value="Submit" />
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

class RenameItem extends React.Component {
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
        });

        alert(this.state.newVal);

        const allCourses = JSON.parse(localStorage.getItem('courses'));
        var courseID;
        for (let i = 0, len = allCourses.length; i < len; ++i) {
            var course = allCourses[i];
            if (course.CourseName === this.props.activeCourse) {
                courseID = course.appID; // identifies current course child name to update
                break;
            }
        }
        const arrModules = this.props.modules;
        const curModule = this.props.moduleTitle;
        console.log(arrModules);
        console.log(curModule);
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
        for ( let i = 0; i < contents.length; ++i) {
            let itemTemp = contents[i];
            if ( (itemTemp === this.props.itemName) && (vark[i] === this.props.vark)) {
                contents[i] = this.state.newVal;
            }
        }

        const newPush = this.props.modules; // record to database
        console.log(newPush);

        this.props.firebase.courses().child(courseID).update({
            modules: newPush.slice(),
        });

        event.preventDefault();
    }    

    render() {
        var inside = (<p className="renamebutton">[Rename]</p>);
        if (this.state.active) {
            inside = (
                <form onSubmit={this.handleSubmit}>
                <label>
                    <input type="text" value={this.state.newVal} onChange={this.handleChange} />
                </label>
                <input className="smallbutton" type="submit" value="Submit" />
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

class ModuleContentItem extends React.Component {
    constructor(props) {
        super(props);
        this.openModal = this.openModal.bind(this);
    }

    openModal() { //this registers the click
        this.props.addVarkClicks(this.props.vark);

        const header = this.props.name;
        ModalManager.open(<MyModal itemName={this.props.name} firebase={this.props.firebase} text={header} modules={this.props.modules} activeCourse={this.props.activeCourse} moduleTitle={this.props.moduleTitle} internal={this.props.internal} vark={this.props.vark} onRequestClose={() => true} teacherMode={this.props.teacherMode}/>);
    }

    render() {

        var teacherMode = this.props.teacherMode;
        var teacherDisplay = (<div />);
        if (teacherMode) {
            teacherDisplay = (
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
        }

        let precede = this.props.vark;
        var attribute = precede+"modulecontentitem"
        return (
            <div>
                <table width="100%">
                    <tr>
                        <td className="leftcontentitem">
                            <div className={attribute} onClick={() => this.openModal()}> 
                                {this.props.name}
                            </div>
                        </td>
                        <td className="rightcontentitem">
                            {teacherDisplay}
                        </td>
                    </tr>
                </table>
            </div>

            
        );
    }
}

class AddModuleContentItemItem extends React.Component {
    constructor(props) {
        super(props);
        this.openModal = this.openModal.bind(this);
    }

    openModal() { //this registers the click
        ModalManager.open(<MyModal itemName="add" firebase={this.props.firebase} moduleTitle={this.props.moduleTitle} activeCourse={this.props.activeCourse} modules={this.props.modules} onRequestClose={() => true} teacherMode={true} addItemMode={true}/>);
    }

    render() {
        var attribute = "modulecontentitem";

        var inner = (<div>Add an item</div>);

        return (
            <div className={attribute} onClick={() => this.openModal()}> 
                {inner}
            </div>
        );
    }
}

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

    var teacherDisplay = (<div />);
    if (teacherMode) {
        teacherDisplay = (
            <RenameModule
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
            <div className="teachermoduletitle">
                <table width="100%">
                    <tr>
                        <td className="leftcontentitem">
                            <div onClick={() => setActive(active==="active" ? "" : "active")}> 
                                {props.name}
                            </div>
                        </td>
                        <td className="rightcontentitem">
                            {teacherDisplay}
                        </td>
                    </tr>
                </table>
            </div>
        );
    }

    return (
        <div>
            <div className={attribute} >
                {topbar}
                <div className="modulecontents">
                    {props.contents.map(
                        contentitem => 
                        (props.varkMode==="All" || props.varkMode===props.vark[props.contents.indexOf(contentitem)])
                        ?
                        (<ModuleContentItem 
                            name={contentitem} 
                            vark={props.vark[props.contents.indexOf(contentitem)]} 
                            internal={props.internals[props.contents.indexOf(contentitem)]}
                            addVarkClicks={props.addVarkClicks}
                            teacherMode={props.teacherMode}
                            moduleTitle={props.name}
                            activeCourse={props.activeCourse}
                            modules={props.modules}
                            firebase={props.firebase}
                        />)
                        :
                        (<div />)
                    )}
                    {addCourseItemItem}
                </div>
            </div>
        </div>
    );
}

function VarkProfile(props) {
    const lineWidth = 60;
    return (
        <div className="varkprofile">
            <table width="100%">
                <tr>
                    <td>
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
                    </td>
                    <td>
                        <div className="varkprofiletext">
                            <p><b>Course VARK Profile</b></p>
                            <p style={{color: "red"}}>Visual</p>
                            <p style={{color: "blue"}}>Auditory</p>
                            <p style={{color: "green"}}>Reading/Writing</p>
                            <p style={{color: "purple"}}>Kinesthetic</p>
                        </div>
                    </td>
                </tr>
            </table>
        </div>
    );
}

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
        <React.Fragment>
            <select name="search_categories" id="search_categories" onChange={this.handleChange} value={value}>
                {options.map(item => (
                <option className="option" key={item.value} value={item.value}>
                    &nbsp;&nbsp;&nbsp;{item.name}
                </option>
                ))}
            </select>
        </React.Fragment>
      );
    }
}

class MainPanel extends React.Component { //the entire right half of the screen where all the modules are
    constructor (props){
        super(props); 
        this.state = {
            varkselection: "All",
        };
        this.handleRemove = this.handleRemove.bind(this);
        this.handleFilter = this.handleFilter.bind(this);
        this.filterCallback = this.filterCallback.bind(this);
        this.getCurrentUserEmail = this.getCurrentUserEmail.bind(this);
        this.getTeacherEmail = this.getTeacherEmail.bind(this);
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

    getTeacherEmail(nameOfCourse) {
        const allCourses = JSON.parse(localStorage.getItem('courses'));
        var teacher;
        for (let i = 0, len = allCourses.length; i < len; ++i) {
            var course = allCourses[i];
            if (course.CourseName === nameOfCourse) {
                teacher = course.nteacher;
            }
        }
        // should be returning correct email. If not, try Object.values(course.nteacher) instead
        return teacher;
    }

    getCurrentUserEmail() {
        const usr = JSON.parse(localStorage.getItem('authUser'));
        const curEmail = Object.values(usr).slice()[1]; // returns string of current user's email
        return curEmail;
    }

    render() { //active: "" means the module is minimized, "active" means its expanded
        var showModules = true;
        var showVarkProfile = true;

        var teacherMode = this.getTeacherEmail(this.props.activeCourse)===this.getCurrentUserEmail();
        // console.log(this.getTeacherEmail(this.props.activeCourse));
        // console.log(this.getCurrentUserEmail());
        // console.log(teacherMode);

        var welcomeMsg;
        var unenroll;
        var filter;
        if (this.props.activeCourse==="none") {
            welcomeMsg = "Select or add a course on the left to get started.";
            unenroll = (
                <div />
            );
            showVarkProfile = false;
            filter = (
                <div />
            );
        }
        else {
            welcomeMsg = "Welcome to " + (this.props.activeCourse);
            unenroll = (
                <div className="removecoursebutton" onClick={this.handleRemove}>
                    Unenroll
                </div>
            );
            filter = (<Select passState={this.handleFilter} default={"Show all VARK types"}/>);
            if (teacherMode) {
                unenroll = (
                    <div className="teachernotice">
                        <p>You are the teacher for this course. You can edit the course below.</p>
                    </div>
                );
                filter = (<div />);
            }
            if (welcomeMsg === "Welcome to Welcome") {
                welcomeMsg = "Select or add a course on the left to get started."
                showModules = false;
                unenroll = (
                    <div />
                );
                showVarkProfile = false;
                filter = (
                    <div />
                );
            }
        }

        var addModuleItem = (<div />);
        if (teacherMode) {
            addModuleItem = (
                <ModuleItem
                    name="New Module"
                    contents={[]}
                    vark={[]}
                    internals={[]}
                    active=""
                    username={this.props.username}
                    addVarkClicks={this.props.addVarkClicks}
                    varkMode={this.state.varkselection}
                    teacherMode={true}
                    activeCourse={this.props.activeCourse}
                    modules={this.props.modules}
                />
            );
        }

        var moduleList = (<div />);
        if (showModules) {
            moduleList = (
                <div className="modulelist">
                    {
                        Object.values(this.props.modules).map(module =>
                            <ModuleItem
                                name={module.title}
                                contents={module.contents}
                                vark={module.vark}
                                internals={module.internals}
                                active=""
                                username={this.props.username}
                                addVarkClicks={this.props.addVarkClicks}
                                varkMode={this.state.varkselection}
                                teacherMode={teacherMode}
                                activeCourse={this.props.activeCourse}
                                modules={this.props.modules}
                                firebase={this.props.firebase}
                            />
                        )
                    }
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

        return (
            <div className="mainpanel">
                <table>
                    <tr>
                        <td>
                            <div className="courseheader">
                                {welcomeMsg}
                                <br /><br />
                                <table>
                                    <tr>
                                        <td>
                                            {unenroll}
                                        </td>
                                        <td>
                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                        </td>
                                        <td>
                                            {filter}
                                        </td>
                                    </tr>
                                </table>
                                <br />
                            </div>
                        </td>

                        <td className="rightalignandfloatdown">
                            {varkProfile}
                        </td>
                    </tr>
                </table>
                <br />
                {moduleList}     
                {addModuleItem}
                <br /> <br /> <br /> <br /> <br /> <br /> <br /> <br /> <br /> <br /> <br /> <br /> <br /> <br /> <br />
            </div>
        )
    }
}

class CreateForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {value: ''};
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {    this.setState({value: event.target.value});  }

    handleSubmit(event) {
        this.props.createCourse(this.state.value);
        event.preventDefault();
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <label>
                    Enter the name for your new course below<br /><br />
                    <input type="text" value={this.state.value} onChange={this.handleChange} /></label>
                <br /><br />
                <input type="submit" value="Submit" />
            </form>
        );
    }
}

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
                needed = course.CourseName;
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

class Container extends React.Component { //the main container for everything on the screen, that also stores most global data in its state
    constructor(props) {
        super(props);

        //bind the state setting functions to the current class
        this.changeActiveCourse = this.changeActiveCourse.bind(this);
        this.addCourseMode = this.addCourseMode.bind(this);
        this.createCourseMode = this.createCourseMode.bind(this);

        this.state = {
            arrCourses: props.courses,
            activeCourse: "none", //to be updated with the current open course
            username: props.name,
            mainPanelMode: 0, //0 means modules view (default), 1 means add-course view, 2 means create-course view
            varkClicks: props.varkClicks,
        }

    }

    changeActiveCourse(nameOfActiveCourse) {
        this.setState({
            mainPanelMode: 0,
            activeCourse: nameOfActiveCourse,
        }, () => {this.render();});
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

    addCourse = (nameOfCourse) => { //actually adds the course
        var newCourses = this.state.arrCourses.slice();
        newCourses.push(nameOfCourse);
        this.setState({
            arrCourses: newCourses.slice(),
        }, () => {this.changeActiveCourse(nameOfCourse);});
        const usr = JSON.parse(localStorage.getItem('authUser'));
        //console.log(Object.values(usr).slice()[2]);
        localStorage.setItem('authUser', JSON.stringify(usr));
        //console.log(Object.values(usr).slice()[2]);
        this.props.firebase.users().child(Object.values(usr).slice()[0]).update({
            courses: newCourses.slice(),
        });
    }

    createCourse = (nameOfCourse) => { //actually adds the course
        alert("Created " + nameOfCourse);
        //TODO: generate classcode, make the course with nameOfCourse, add it to the db
        var classCode = "002"; // <-- set this to the class code

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
        //console.log(Object.values(usr).slice()[6]);
        localStorage.setItem('authUser', JSON.stringify(usr));
        //console.log(Object.values(usr).slice()[6]);
        this.props.firebase.users().child(Object.values(usr).slice()[0]).update({
            wvarkclicks: newVark.slice(),
        });
    }

    removeCourse = (nameOfCourse) => {
        var newCourses = this.state.arrCourses.slice();
        var newnewCourses = [];
        newCourses.forEach(element => {
            if (!(element===nameOfCourse)) {
                newnewCourses.push(element);
            }
        });
        newCourses = newnewCourses.slice();
        this.setState({
            arrCourses: newCourses.slice(),
        }, () => {this.changeActiveCourse(this.state.arrCourses.slice()[0]);});
        const usr = JSON.parse(localStorage.getItem('authUser'));
        //console.log(Object.values(usr).slice()[2]);
        localStorage.setItem('authUser', JSON.stringify(usr));
        //console.log(Object.values(usr).slice()[2]);
        this.props.firebase.users().child(Object.values(usr).slice()[0]).update({
            courses: newCourses.slice(),
        });
    }

    getModules(name) {
        const allCourses = JSON.parse(localStorage.getItem('courses')); // here is a parsed json of the course list
        if ( name === "none")
            return []

        for (let i = 0, len = allCourses.length; i < len; ++i) {
            var course = allCourses[i];


            if ( course.CourseName === name) { //now we've retrieved the correct course to display
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

    render() {
        var mainpanel;
        if (this.state.mainPanelMode===0) {
            mainpanel = <MainPanel firebase={this.props.firebase} username={this.state.username} activeCourse={this.state.activeCourse} modules={this.getModules(this.state.activeCourse)} removeCourse={this.removeCourse} addVarkClicks={this.addVarkClicks}/>
        } else if (this.state.mainPanelMode===1) {
            mainpanel = <AddCoursePanel username={this.state.username} currentCourses={this.state.arrCourses} addCourse={this.addCourse}/>
        } else if (this.state.mainPanelMode===2) {
            mainpanel = <CreateCoursePanel username={this.state.username} currentCourses={this.state.arrCourses} createCourse={this.createCourse}/>
        }
        return (
            <div className="App">
                <div className="container">
                    <div className="left-element">
                        <Sidebar
                            username={this.state.username}
                            activeCourse={this.state.activeCourse}
                            arrCourses={this.state.arrCourses}
                            changeActiveCourse={this.changeActiveCourse}
                            addCourseMode={this.addCourseMode}
                            createCourseMode={this.createCourseMode}
                        />
                    </div>
                    <div className="right-element">
                        {mainpanel}
                    </div>
                </div>
            </div>
        );
    }
}

class Home extends React.Component {
    constructor(props) {
        super(props);
        const usr = JSON.parse(localStorage.getItem('authUser'));
        this.state = {
            username: Object.values(usr).slice()[4],
            email: Object.values(usr).slice()[1],
            courses: Object.values(usr).slice()[2],
            varkClicks: Object.values(usr).slice()[6],
        }
    }
    componentDidMount() {
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

    }

    render() {
        return ( //when login is implemented, it should create an app with the appropriate username passed in
            <Container name={this.state.username} courses={this.state.courses} firebase={this.props.firebase} varkClicks={this.state.varkClicks} />
        );
    }
}


const condition = authUser => !!authUser;

export default withAuthorization(condition)(Home);
