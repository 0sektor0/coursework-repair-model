import ModelResult from "./model-result";



export default class RepairModel {
    private _tno: number;       // время наработки на отказ
    private _t0: number;        // сред время ремонта одного пк
    private _mun0: number;      // инетнсивность отказов одного пк
    private _mu0: number;       // интенсивность ремонта
    private _n: number;         // число пк
    private _c: number;         // число ремонтников
    private _xsi: number;       // коэф отношения
    private _sr: number;        // зарплата ремонтника
    private _s: number;         // потери производства
    private _pk: Array<number>; // вероятность, что к пек сломано


    constructor(tno: number, t0: number, n: number, c: number, s: number, sr: number) {
        this._tno = tno;
        this._t0 = t0;
        this._n = n;
        this._c = c;
        this._s = s;
        this._sr = sr;

        this._mun0 = 1 / tno;
        this._mu0 = 1 / t0;
        this._xsi = this._mun0 / this._mu0;
        this._pk = new Array<number>(n + 1);

        this.CalcPk();
    }

    public static Factorial(num: number): number {
        let factorial: number = 1

        if (num == 0)
            return factorial;

        for (let i: number = 1; i <= num; i++)
            factorial *= i;

        return factorial;
    }

    private CalcPk() {
        let sum1: number = 0;
        for (let k: number = 0; k <= this._c; k++) {
            let devidend: number = RepairModel.Factorial(this._n) * this._xsi ** k;
            let devider: number = RepairModel.Factorial(k) * RepairModel.Factorial(this._n - k);
            sum1 += devidend / devider;
        }

        let sum2: number = 0;
        for (let k: number = this._c + 1; k <= this._n; k++) {
            let devidend: number = RepairModel.Factorial(this._n) * this._xsi ** k;
            let devider: number = this._c ** (k - this._c) * RepairModel.Factorial(this._c) * RepairModel.Factorial(this._n - k);
            sum2 += devidend / devider;
        }

        this._pk[0] = (sum1 + sum2) ** -1;

        for (let k: number = 1; k <= this._n; k++) {
            let devidend: number = RepairModel.Factorial(this._n) * this._xsi ** k;
            let devider: number = 0;

            if (k <= this._c)
                devider = RepairModel.Factorial(k) * RepairModel.Factorial(this._n - k);
            else
                devider = this._c ** (k - this._c) * RepairModel.Factorial(this._c) * RepairModel.Factorial(this._n - k);

            this._pk[k] = devidend / devider * this._pk[0];
        }
    }

    public CalculateModel(): ModelResult {
        let result = new ModelResult();

        this.CalculateQ(result);
        this.CalculateL(result);
        result.P0 = this._pk[0];
        result.U = result.L - result.Q;
        result.Ro0 = result.U / this._c;
        result.Tp = result.L * this._tno / (this._n - result.L);
        result.W = result.Tp - this._t0;
        result.Tc = result.Tp + this._tno;
        result.Re = this._tno / result.Tc;
        result.N = this._n - result.L;
        result.ReRo = result.Re / result.Ro0;
        result.Y = this._c * this._sr + result.L * this._s;

        return result;
    }

    private CalculateQ(result: ModelResult) {
        result.Q = 0;

        for (let k = this._c; k <= this._n; k++)
            result.Q += (k - this._c) * this._pk[k];
    }

    private CalculateL(result: ModelResult) {
        result.L = 0;

        for (let k = 1; k <= this._n; k++)
            result.L += k * this._pk[k];
    }
}   