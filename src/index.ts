import { SerialPort, ReadlineParser } from "serialport";
import Axios from "axios";

let soundData: number[] = [];
const domain = "https://53d8-169-234-95-134.ngrok.io/caption"

let stop = false;
let isUploading = false;

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

const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }))

parser.on("data", (data) => {


    // check if we are not stopped
    // if we are not stopped:
    // check data result

    if (!stop) {
        if (data >= 0) {
            let trimmed = data.replace(/^\s+|\s+$/g, '');
            const dataNum = parseInt(trimmed);
            if (!isNaN(dataNum)) {
                soundData.push(data);
                console.log(data);
            } else {
                console.log(trimmed, "is not a number");
            }

        }
        // if (soundData.length > 30000) {
        //     soundData = [];
        // }
    } else {
        if (!isUploading) {
            // go upload
            isUploading = true;
            let intArray = soundData.map((data: any) => {
                return parseInt(data);
            });

            // intArray = [1, 2, 3];
            Axios.post(domain + "/caption", { "sound:": intArray })
                .then((res) => {
                    const data = res.data;
                    if (typeof data !== "string") {
                        console.error("Did not get a string: ", data);
                    } else {
                        console.log(data);
                        port.write(data);
                    }
                })
                .catch((e) => {
                    console.log("Axios error");
                    console.error(e);
                }).finally(() => {
                    soundData = [];
                    stop = false;
                    isUploading = false;
                    process.exit();
                });
        }
    }

});

setTimeout(() => {
    // go upload
    isUploading = true;
    let intArray = soundData.map((data: any) => {
        return parseInt(data);
    });

    // intArray = [1, 2, 3];
    Axios.post(domain + "/caption", { "sound:": intArray })
        .then((res) => {
            const data = res.data;
            if (typeof data !== "string") {
                console.error("Did not get a string: ", data);
            } else {
                console.log(data);
                port.write(data);
            }
        })
        .catch((e) => {
            console.log("Axios error");
            console.error(e);
        }).finally(() => {
            soundData = [];
            stop = false;
            isUploading = false;
            process.exit();
        });
}, 5000)

// Keystroke listening
let stdin = process.stdin;

// Get keystroke without pressing enter
stdin.setRawMode(true);

stdin.resume();

stdin.setEncoding('utf8');

stdin.on('data', (keyBuf) => {
    // spacebar to send the data
    let key = Buffer.from(keyBuf).toString();
    if (key === ' ') {
        console.log("STOPPED");
        stop = true;
    } else if (key === '\u0003') {
        // ctrl + c
        process.exit();
    } else if (key === "w") {
        // make a get request for a text in the backend and write it
        Axios.get(domain + "/wav").then((res) => {
            console.log(res.data);
            const data = res.data;
            // write to serial
            port.write(data);
        }).finally(() => {
            process.exit();
        })
    }
});