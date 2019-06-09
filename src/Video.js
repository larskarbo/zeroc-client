import React, { Component } from 'react';
// import ffmpeg from "ffmpeg.js"
import { RdxVideo, Overlay, Controls } from 'react-html5-video-editor'
import 'react-image-crop/dist/ReactCrop.css';
import ReactCrop from 'react-image-crop';
import qs from 'qs'
import Slider, { Range } from 'rc-slider';
import 'rc-slider/assets/index.css';
import Croppr from 'croppr';

class Video extends Component {
    constructor() {
        super()
        this.state = {
            crop: {
                // height: 720,
                // width: 960,
                // x: 0,
                // y: 0
            },
            start: 0,
            end: 0
        }


        this.linkpre = "http://zeroc.local:3000/"
    }

    componentDidMount() {
        setTimeout(() => {
            console.log('this.v: ', this.v);
            this.width = this.v.offsetWidth
            this.height = this.v.offsetHeight
            this.setState({
                end: this.v.duration
            })

        }, 5000)
    }

    download = (exx) => {
        this.setState({
            cropping: false
        })
        console.log(this.state)
        var obj = {
            start: this.state.start,
            end: this.state.end,
            crop: this.state.crop,
            name: this.props.video.name,
            exercise: exx
        }
        console.log('obj: ', obj);
        window.fetch(this.linkpre + "truecoach?" + qs.stringify(obj), {
            method: "GET"
        }).then(j => j.json()).then(r => {
            this.setState({
                uploaded: true
            })
            console.log(r)
        })
        console.log('this.linkpre + "truecoach?"+qs.stringify(obj): ', this.linkpre + "truecoach?" + qs.stringify(obj));

    }

    render() {
        const v = this.props.video
        console.log('this.state: ', this.state);
        return (
            <div className="Video">
                <div key={v.name} className="card">
                    <header className="card-header">
                        <p className="card-header-title">
                            {v.name}
                        </p>
                        <a href="#" className="card-header-icon" aria-label="more options">
                            <span className="icon">
                                <i className="fas fa-angle-down" aria-hidden="true"></i>
                            </span>
                        </a>
                    </header>
                    <div className="card-content">
                        <div className="content">
                            {this.state.cropping &&
                                <>
                                    <ReactCrop
                                        onChange={(crop) => {
                                            this.setState({ crop });
                                        }}
                                        crop={this.state.crop}
                                        src={this.linkpre + v.name.replace(".mp4", ".jpg")} />
                                </>
                            }
                            <video
                                style={{
                                    display: this.state.cropping ? "none" : "block"
                                }}
                                poster={this.linkpre + v.name.replace(".mp4", ".jpg")}
                                controls
                                ref={v => {
                                    console.log('this.v: ', this.v);
                                    this.v = v
                                }}
                            >
                                <source src={this.linkpre + v.name} type="video/mp4" />
                                <br />
                            </video>
                            start: {this.state.start}, end: {this.state.end}
                        </div>
                    </div>
                    <footer className="card-footer">
                        <a href={this.linkpre + v.name} className="card-footer-item">Download</a>

                        {this.state.cropping ?
                            <a onClick={() => {
                                this.setState({
                                    cropping: false
                                })
                                var ratio = 960/this.width
                                console.log('this.width: ', this.width);
                                console.log('ratio: ', ratio);
                                this.setState({
                                    crop: {
                                        ...this.state.crop,
                                        x: this.state.crop.x * ratio,
                                        y: this.state.crop.y * ratio,
                                        width: this.state.crop.width * ratio,
                                        height: this.state.crop.height * ratio,
                                    }
                                })
                            }} className="card-footer-item">finish crop</a>
                            :
                            <a onClick={() => {
                                this.setState({
                                    cropping: true
                                })
                            }} className="card-footer-item">cropset</a>
                        }
                        <a onClick={() => {
                            this.setState({
                                start: this.v.currentTime
                            })
                        }} className="card-footer-item">TRIM:Start</a>
                        <a onClick={() => {
                            this.setState({
                                end: this.v.currentTime
                            })
                        }} className="card-footer-item">TRIM:End</a>
                    </footer>
                    <footer className="card-footer">
                        {this.state.uploaded &&
                            "done"
                        }
                        <a onClick={() => {
                            this.download("squat")
                        }} className="card-footer-item">Upload to truecoach(squat)</a>
                        <a onClick={() => {
                            this.download("bench")
                        }} className="card-footer-item">Upload to truecoach(bench/press)</a>
                        <a onClick={() => {
                            this.download("deadlift")
                        }} className="card-footer-item">Upload to truecoach(dl)</a>
                    </footer>
                </div>
                <br />
            </div>

        );
    }
}

export default Video;