import React, { Component } from 'react';
import './App.scss';
import 'bulma/css/bulma.css'
import image from './im.gif'
import progr from './progr.gif'
import { DateTime } from 'luxon'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Stream from "./Stream"

/*
 *
 * This is the main component
 * 
 */

document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady() {
  // print('window: ', window)
  console.log('device ready')
  console.log('window: ', window);
  // console.log(device.cordova);
  // console.log('device.cordova: ', device.cordova);
}

function decode(v) {
  let str = ""
  for (var i = 0; i < v.byteLength; i++) {
    const yo = v.getUint8(i)
    str += String.fromCharCode(yo)
  }
  return str
}




class App extends Component {
  constructor() {
    super()
    this.state = {
      connected: false,
      recording: false,
      stream: false,
      videos: [
        // {
        //   name: "1234.mp4",
        //   screenshot: "1234.png",
        //   length: 123
        // },
        // {
        //   name: "1234.mp4",
        //   screenshot: "1234.png",
        //   length: 123
        // },
        // {
        //   name: "1234.mp4",
        //   screenshot: "1234.png",
        //   length: 123
        // }
      ]
    }

    this.linkpre = "http://zeroc.local:3000/"
  }

  componentDidMount() {
    // var url = 'https://image.shutterstock.com/image-vector/600-vector-thin-line-mini-450w-787030678.jpg'; // file or remote URL. url can also be dataURL, but giving it a file path is much faster
    // var album = 'MyAppName';
    // window.url = url;
    // window.cordova.plugins.saveToCameraRoll.saveImage(url, "asdf", function (cameraRollAssetId) {
    //   console.log('cameraRollAssetId: ', cameraRollAssetId);

    // }, function (err) {
    //   console.log('err: ', err);

    // });
  }

  async begin() {
    const options = {
      filters: [{ name: 'zeroc' }],
      optionalServices: ['17283985-3729-0129-3487-120938478700']
    }

    try {
      const device = await navigator.bluetooth.requestDevice(options)
      console.log('device: ', device);
      const gatt = await device.gatt.connect()
      console.log('gatt: ', gatt);
      const primaryService = await gatt.getPrimaryService("17283985-3729-0129-3487-120938478700")
      console.log('primaryService: ', primaryService);

      const videoChar = await primaryService.getCharacteristic("17283985-3729-0129-3487-120938478701")
      console.log('videoChar: ', videoChar);
      // const deviceChar = await primaryService.getCharacteristic("17283985-3729-0129-3487-120938478702")
      // console.log('deviceChar: ', deviceChar);
      // const snapChar = await primaryService.getCharacteristic("17283985-3729-0129-3487-120938478703")


      const value = videoChar.readValue()
        .then(v => {
          console.log('v: ', v);
          var str = decode(v);
          console.log('str: ', str);
          this.setState({
            videos: JSON.parse(str)
          })
        })
        .catch(e => {
          console.warn("ERROR", e, e.message)

          toast(e.message)
        })


      await videoChar.startNotifications()
      videoChar.addEventListener('characteristicvaluechanged', (asdf) => {
        window.asdf = asdf
        const dw = asdf.target.value
        let str = ""
        for (var i = 0; i < dw.byteLength; i++) {
          const yo = dw.getUint8(i)
          str += String.fromCharCode(yo)
        }

        const obj = JSON.parse(str)
        console.log('obj: ', obj);
        if (obj.type == "streamstart") {
          this.setState({
            stream: true
          })
        } else if (obj.type == "streamstop") {
          this.setState({
            stream: false,
          })
        } else if (obj.type == "recfinish") {
          this.setState({
            recording: false,
            encoding: true,
          })
        } else if (obj.type == "recstart") {
          this.setState({
            recording: true
          })
        } else if (obj.type == "videofinish") {
          this.setState({
            recording: false,
            encoding: false,
            videos: [...this.state.videos, obj]
          })
        } else if (obj.type == "error") {
          toast(JSON.stringify(obj.err))
        }
        console.log('str: ', str);
      });


      this.setState({
        connected: true
      })

      this.videoChar = videoChar

    } catch (error) {
      console.error('error: ', error);
      console.error('error message: ', error.message);
    }
  }

  startRec() {
    var startRec = Uint8Array.of(1);
    return this.videoChar.writeValue(startRec);
  }


  stopRec() {
    var v = Uint8Array.of(0);
    return this.videoChar.writeValue(v);
  }

  startStream() {
    var v = Uint8Array.of(2);
    return this.videoChar.writeValue(v);
  }

  stopStream() {
    var v = Uint8Array.of(3);
    return this.videoChar.writeValue(v);
  }

  render() {
    console.log('this.state.videos: ', this.state.videos);
    let videos = this.state.videos.map(v => ({
      ...v,
      date: DateTime.fromISO(v.date)
    }))
    videos = videos.reverse()
    videos = videos.sort((a, b) => parseInt(b.name.split(".")) - parseInt(a.name.split(".")))
    return (
      <div className="App">
        <section className="section">
          <div className="container">
            <p>
              <h1 className="is-title is-large has-text-white">ZEROC</h1>
            </p>
            {!this.state.connected &&

              <a
                onClick={() => {
                  this.begin()
                }}
                className="button is-large is-fullwidth">
                connect
              </a>
            }


            {this.state.connected &&
              <>
                {!this.state.stream &&
                  <>
                    <a
                      onClick={() => {
                        // this.begin()
                        this.startStream()
                      }}
                      className="button is-large is-fullwidth">
                      start stream
              </a>

                    <a
                      onClick={() => {
                        this.startRec()
                      }}
                      className="button is-large is-fullwidth">
                      start!</a>
                    <a
                      onClick={() => {
                        this.stopRec()
                      }}
                      className="button is-large is-fullwidth">
                      stop!</a>
                  </>
                }

                {this.state.stream &&
                  <>
                    <a
                      onClick={() => {
                        this.stopStream()
                      }}
                      className="button is-large is-fullwidth">
                      Stop stream
              </a>
                    <Stream />
                  </>
                }
              </>
            }
            {this.state.recording &&
              <>
                {/* <a
                onClick={() => {
                  this.begin()
                }}
              className="button is-large is-fullwidth">Recording
                </a> */}
              <h1 className="title has-text-white">🚢</h1>
                {/* <img src={image} /> */}
              </>
            }

            {this.state.encoding &&
              <>
                {/* <a
                onClick={() => {
                  this.begin()
                }}
              className="button is-large is-fullwidth">Recording
                </a> */}
                <img src={progr} />
              </>
            }

          </div>
        </section>
        {!this.state.encoding &&
          <div className="container">
            {videos.map(v => (
              // <div>
              //   name: {v.name}
              //   length: {v.length}
              // </div>
              <>
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
                      <video
                        poster={this.linkpre + v.name.replace(".mp4", ".jpg")}
                        controls
                      >
                        <source src={this.linkpre + v.name} type="video/mp4" />
                        <br />
                      </video>
                    </div>
                  </div>
                  <footer className="card-footer">
                    <a href={this.linkpre + v.name} className="card-footer-item">Download</a>
                    <a href="#" className="card-footer-item">--</a>
                    <a href="#" className="card-footer-item">--</a>
                  </footer>
                </div>
                <br />
              </>
            ))}
          </div>
        }
        <ToastContainer />
      </div>

    );
  }
}

export default App;
