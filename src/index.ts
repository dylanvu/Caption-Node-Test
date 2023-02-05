import { SerialPort, ReadlineParser } from "serialport";
import Axios from "axios";

let soundData: number[] = [];
const soundEndpoint = "https://b6e7-169-234-95-134.ngrok.io/caption"


// Create a port
const port = new SerialPort({
    path: 'COM5',
    baudRate: 115200,
});

// port.open(function (err) {
//     if (err) {
//         return console.log('Error opening port: ', err.message)
//     }

//     // Because there's no callback to write, write errors will be emitted on the port:
//     port.write('main screen turn on')
// });

// when sound data is sent over, save it

const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }))

parser.on("data", (data) => {
    // const dataBuf = data;
    // const dataString = Buffer.from(dataBuf, 'hex').toString();
    // console.log(dataString)
    // console.log(data);
    if (data >= 0) {
        soundData.push(data);
    } else {
        console.log("Got something not positive:", data);
        if (data === -1) {
            // this is the stop signal
            Axios.post(soundEndpoint, JSON.stringify(soundData))
                .then((res) => {
                    const data = res.data;
                    if (typeof data !== "string") {
                        console.error("Did not get a string: ", data);
                    } else {
                        console.log(data);
                        port.write(data);
                    }
                    soundData = [];
                })
                .catch((e) => {
                    console.log("Axios error");
                    console.error(e);
                })
        }
    }
});