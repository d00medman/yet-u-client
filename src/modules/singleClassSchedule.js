import React,  { useState } from 'react';
import axios from 'axios';
import DatePicker from "react-datepicker";

class SingleClassScheduleComponent extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            classTimes: [],
            startDate: new Date(),
            displaySchedule: true,
            errorMessage: '',
            currentCourseName: this.props.courseName,
            newCourseName: this.props.courseName,
            newCourseDurationMinutes: this.props.durationMinutes,
        }

        this.getCourseTimes = this.getCourseTimes.bind(this)
        this.setStartDate = this.setStartDate.bind(this)
        this.createNewSession = this.createNewSession.bind(this)
        this.removeSession = this.removeSession.bind(this)
        this.changeCourseName = this.changeCourseName.bind(this)
        this.changeCourseDuration = this.changeCourseDuration.bind(this)
        this.updateCourse = this.updateCourse.bind(this)
        this.switchToSchedule = this.switchToSchedule.bind(this)
        this.switchToEdit = this.switchToEdit.bind(this)
    }

    componentDidMount() {
        this.getCourseTimes()
    }

    setStartDate(date) {
        this.setState({
          startDate: date,
          errorMessage: ''
        },  () => {
            console.log('state in set state in setStartDate')
            console.log(this.state);
        })
    }

    // duplicated from create course. Would be nice to find a way to make this modular
    changeCourseName(event) {
        this.setState({
            newCourseName: event.target.value,
            errorMessage: ''
        },  () => {
          console.log('state in changeCourseName')
          console.log(this.state);
        });
    }

    changeCourseDuration(event) {
        this.setState({
            newCourseDurationMinutes: event.target.value,
            errorMessage: ''
        },  () => {
          console.log('state in changeCourseDuration')
          console.log(this.state);
        });
    }

    switchToEdit() {
        this.setState({
            displaySchedule: false,
            errorMessage: ''
        },  () => {
          console.log('state in switchToEdit')
          console.log(this.state);
        });
    }

    switchToSchedule() {
        this.setState({
            displaySchedule: true,
            newCourseName: this.props.courseName,
            newCourseDurationMinutes: this.props.durationMinutes,
            errorMessage: ''
        },  () => {
          console.log('state in switchToSchedule')
          console.log(this.state);
        });
    }

    async getCourseTimes() {
        console.log('getCourseTimes')
        const { courseId } = this.props

        try {
            const response = await axios.get(
                `http://localhost:8890/courses?course_id=${courseId}`,
            )

            console.log(response)

            this.setState({
                classTimes: response.data,
                errorMessage: ''
            },  () => {
                console.log('state in set state in getCourseTimes')
                console.log(this.state);
            });
        } catch(error) {
            console.log('error in getCourseTimes')
            console.log(error)
        }
    }

    async removeSession(sessionId) {
        const { classTimes } = this.state

        try {
            const response = await axios.delete(
                `http://localhost:8890/course-session?session_id=${sessionId}`,
            )

            console.log(response)

            if (response.status === 200) {
                const schedule = classTimes.filter(session => session.id !== sessionId);
                // this.props.successfulCourseCreate([...classSchedule, {name: newCourseName, id: response.data.id}])
                this.setState({
                    classTimes: schedule,
                    errorMessage: ''
                },  () => {
                  console.log('state in removeSession')
                  console.log(this.state);
                });
            } else {
                this.setState({
                    errorMessage: response.data.msg
                },  () => {
                  console.log('state in removeSession')
                  console.log(this.state);
                });
            }
        } catch(error) {
            console.log('error in removeSession')
            console.log(error)
        }
    }

    async createNewSession() {
        const { courseId } = this.props
        const { startDate, classTimes } = this.state

        try {
            const response = await axios.post(
                'http://localhost:8890/course-session',
                JSON.stringify({course_id: courseId, starts_at: startDate}),
                { 
                    headers: { 
                      'Content-Type': 'application/json',
                    },
                }
            )

            console.log(response)

            if (response.status === 200) {
                // this.props.successfulCourseCreate([...classSchedule, {name: newCourseName, id: response.data.id}])
                const newSession = {
                    id: response.data.id,
                    starts_at: response.data.timeframe.starts_at, 
                    ends_at: response.data.timeframe.ends_at
                }
                this.setState({
                    classTimes: [...classTimes, newSession],
                    errorMessage: ''
                },  () => {
                  console.log('state in createNewSession')
                  console.log(this.state);
                });
            } else {
                this.setState({
                    errorMessage: response.data.msg
                },  () => {
                  console.log('state in createNewSession')
                  console.log(this.state);
                });
            }
        } catch(error) {
            console.log('error in createNewSession')
            console.log(error)

            this.setState({
                errorMessage: error.message
            },  () => {
              console.log('state in createCourse')
              console.log(this.state);
            });
        }
    }

    async updateCourse() {
        const { newCourseName, newCourseDurationMinutes} = this.state
        const { courseId, durationMinutes } = this.props

        try {
            const response = await axios.patch(
                `http://localhost:8890/courses`,
                JSON.stringify({course_id: courseId, course_name: newCourseName, duration: parseInt(newCourseDurationMinutes)}),
                { 
                    headers: { 
                      'Content-Type': 'application/json',
                    },
                }
            )
            console.log('response in updateCourse')
            console.log(response)

            if (response.status === 200) {
                // this.props.successfulCourseCreate([...classSchedule, {name: newCourseName, id: response.data.id}])
                this.setState({
                    currentCourseName: newCourseName,
                    errorMessage: ''
                },  () => {
                  console.log('state in createCourse')
                  console.log(this.state);
                });

                // If we changed the duration, we need to recalculate the time windows
                if (durationMinutes !== newCourseDurationMinutes) {
                    this.getCourseTimes()
                }
                

                this.switchToSchedule()
            } else {
                this.setState({
                    errorMessage: response.data.msg
                },  () => {
                  console.log('state in createCourse')
                  console.log(this.state);
                });
            }
        } catch(error) {
            console.log('error in createCourse')
            console.log(error)

            this.setState({
                errorMessage: error.message
            },  () => {
              console.log('state in createCourse')
              console.log(this.state);
            });
        }
    }

    renderSchedule() {
        const { classTimes, startDate } = this.state

        return (
            <div>
                {classTimes.length < 1 && <h5>No scheduled sessions for this course</h5>}
                <ul>
                    {classTimes.map((classBlock, index) => {
                        return (
                            <div>
                                <li>From {classBlock.starts_at} to {classBlock.ends_at}</li>
                                <button onClick={() => this.removeSession(classBlock.id)}>Remove Session</button>
                            </div>
                        )
                    })}
                </ul>
                <label>
                    Add New Session
                    <DatePicker
                        selected={startDate}
                        onChange={date => this.setStartDate(date)}
                        dateFormat="MM/dd/yyyy h:mm aa"
                        showTimeSelect
                        timeFormat="HH:mm"
                        timeIntervals={20}
                        timeCaption="time"
                        dateFormat="MMMM d, yyyy h:mm aa"
                    />
                </label>
                <button onClick={() => this.createNewSession()}>Confirm</button>
            </div>
        )
    }

    renderViewSwitchButton() {
        const { displaySchedule } = this.state
        if (displaySchedule) {
            return (
                <button onClick={() => this.switchToEdit()}>
                    Edit this Course
                </button>
            )
        } else {
            return (
                <button onClick={() => this.switchToSchedule()}>
                    Return to Schedule
                </button>
            )
        }
    }

    renderEditCourseForm() {
        const { newCourseName, newCourseDurationMinutes } = this.state
        return (
            <div>
                <label>
                    New Course Name:
                    <input type="text" value={newCourseName} onChange={this.changeCourseName} />
                </label>
                <label>
                    New Course Duration (Minutes):
                    <input type="number" value={newCourseDurationMinutes} onChange={this.changeCourseDuration} />
                </label>
                <button onClick={() => this.updateCourse()}>
                    Update
                </button>
            </div>
        )
    }

    render() {
        const { errorMessage, displaySchedule, currentCourseName } = this.state
        // const [startDate, setStartDate] = useState(new Date());
        const primaryDisplayComponent = displaySchedule ? this.renderSchedule() : this.renderEditCourseForm()
        const swapButton = this.renderViewSwitchButton()
        return (
            <div>
                <h2>{currentCourseName}</h2>
                {swapButton}
                {primaryDisplayComponent}
                {errorMessage !== '' && <h4>Error: {errorMessage}</h4>}
            </div>
        )
    }
}

export default SingleClassScheduleComponent