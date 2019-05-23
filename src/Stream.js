import React, { Component } from 'react';


class Stream extends Component {

    componentDidMount() {
        console.log('yo')
        var imageNr = 0; // Serial number of current image
        var finished = []; // References to img objects which have finished downloading
        this.paused = false;

        const createImageLayer = () => {
            var img = new Image();
            img.style.position = "absolute";
            img.style.zIndex = -1;
            img.style.left="0"
            img.onload = imageOnload;
            img.onclick = imageOnclick;
            img.src = "http://zeroc.local:9000/?action=snapshot&n=" + (++imageNr);
            var webcam = this.div
            try {
                webcam.insertBefore(img, webcam.firstChild);
            } catch (e) {
                
            }
        }

        // Two layers are always present (except at the very beginning), to avoid flicker
        function imageOnload() {
            this.style.zIndex = imageNr; // Image finished, bring to front!
            while (1 < finished.length) {
                var del = finished.shift(); // Delete old image(s) from document
                del.parentNode.removeChild(del);
            }
            finished.push(this);
            if (!this.paused) createImageLayer();
        }

        function imageOnclick() { // Clicking on the image will pause the stream
            this.paused = !this.paused;
            if (!this.paused) createImageLayer();
        }

        createImageLayer()

    }

    componentDidUnMount() {
        this.paused = true
    }

    render() {
        return (
            <div
                style={{
                    height:500
                }}
                ref={d => this.div = d}
            ></div>
        )
    }
}

export default Stream