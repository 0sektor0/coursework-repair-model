import RepairModel from "./repair-model"
import ModelResult from "./model-result";



function CalculateRpairModel(tno: number, t0: number, n: number, c: number, s: number, sr: number): ModelResult {
    let model = new RepairModel(tno, t0, n, c, s, sr);
    let result = model.CalculateModel();

    return result;
}

let result = CalculateRpairModel(800, 8, 25, 2, 1000, 250);
console.log("");