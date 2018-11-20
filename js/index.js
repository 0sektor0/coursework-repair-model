"use strict";



var ModelResult = /** @class */ (function () {
    function ModelResult() {
        this.P0 = 0;
        this.Q = 0;
        this.L = 0;
        this.U = 0;
        this.Ro0 = 0;
        this.N = 0;
        this.Re = 0;
        this.W = 0;
        this.Tp = 0;
        this.Tc = 0;
        this.ReRo = 0;
        this.Y = 0;
    }
    return ModelResult;
}());


var RepairModel = /** @class */ (function () {
    function RepairModel(tno, t0, n, c, s, sr) {
        this._tno = tno;
        this._t0 = t0;
        this._n = n;
        this._c = c;
        this._s = s;
        this._sr = sr;
        this._mun0 = 1 / tno;
        this._mu0 = 1 / t0;
        this._xsi = this._mun0 / this._mu0;
        this._pk = new Array(n + 1);
        this.CalcPk();
    }
    RepairModel.Factorial = function (num) {
        var factorial = 1;
        if (num == 0)
            return factorial;
        for (var i = 1; i <= num; i++)
            factorial *= i;
        return factorial;
    };
    RepairModel.prototype.CalcPk = function () {
        var sum1 = 0;
        for (var k = 0; k <= this._c; k++) {
            var devidend = RepairModel.Factorial(this._n) * Math.pow(this._xsi, k);
            var devider = RepairModel.Factorial(k) * RepairModel.Factorial(this._n - k);
            sum1 += devidend / devider;
        }
        var sum2 = 0;
        for (var k = this._c + 1; k <= this._n; k++) {
            var devidend = RepairModel.Factorial(this._n) * Math.pow(this._xsi, k);
            var devider = Math.pow(this._c, (k - this._c)) * RepairModel.Factorial(this._c) * RepairModel.Factorial(this._n - k);
            sum2 += devidend / devider;
        }
        this._pk[0] = Math.pow((sum1 + sum2), -1);
        for (var k = 1; k <= this._n; k++) {
            var devidend = RepairModel.Factorial(this._n) * Math.pow(this._xsi, k);
            var devider = RepairModel.Factorial(k) * RepairModel.Factorial(this._n - k);
            this._pk[k] = devidend / devider * this._pk[0];
        }
    };
    RepairModel.prototype.CalculateModel = function () {
        var result = new ModelResult();
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
    };
    RepairModel.prototype.CalculateQ = function (result) {
        result.Q = 0;
        for (var k = this._c; k <= this._n; k++)
            result.Q += (k - this._c) * this._pk[k];
    };
    RepairModel.prototype.CalculateL = function (result) {
        result.L = 0;
        for (var k = 1; k <= this._n; k++)
            result.L += k * this._pk[k];
    };
    return RepairModel;
}());


function CalculateRpairModel(tno, t0, n, c, s, sr) {
    var model = new RepairModel(tno, t0, n, c, s, sr);
    var result = model.CalculateModel();
    return result;
}


function readInput() {
    let input = {
        Tno: document.getElementById("inputTno").value,
        T0: document.getElementById("inputT0").value,
        N: document.getElementById("inputN").value,
        C: document.getElementById("inputC").value,
        S: document.getElementById("inputS").value,
        Sr: document.getElementById("inputSr").value,
    }

    return input;
}


function startCalculations() {
    let i = readInput();
    let result = CalculateRpairModel(i.Tno, i.T0, i.N, i.C, i.S, i.Sr);

    printResult(result);
}


function createResultField(text) {
    let p = document.createElement('p');
    p.innerHTML = text;
    return p;
}


function printResult(result) {
    let resultDiv = document.getElementById("resultDiv");
    while (resultDiv.firstChild)
        resultDiv.removeChild(resultDiv.firstChild);

    resultDiv.hidden = false;
    let count = document.getElementById("inputCount").value;

    resultDiv.appendChild(createResultField(`вероятность отказа 0 компьютеров P0: ${result.P0.toFixed(count)}`));
    resultDiv.appendChild(createResultField(`Среднее количество компьютеров в очереди на ремонт Q: ${result.Q.toFixed(count)}`));
    resultDiv.appendChild(createResultField(`Среднее количество сломаных компьютеров L: ${result.L.toFixed(count)}`));
    resultDiv.appendChild(createResultField(`Среднее количество компьютеров на ремонтеU: ${result.U.toFixed(count)}`));
    resultDiv.appendChild(createResultField(`Коэффициент загрузки одного специалиста Ro0: ${result.Ro0.toFixed(count)}`));
    resultDiv.appendChild(createResultField(`Среднее количество исправных компьютеров n: ${result.N.toFixed(count)}`));
    resultDiv.appendChild(createResultField(`коэффициент загрузки компьютера Re: ${result.Re.toFixed(count)}`));
    resultDiv.appendChild(createResultField(`Среднее время нахождения компьютера в очереди на ремонт W: ${result.W.toFixed(count)} ч`));
    resultDiv.appendChild(createResultField(`Среднее время прибывания компьютера в неисправном состоянии Tp: ${result.Tp.toFixed(count)} ч`));
    resultDiv.appendChild(createResultField(`Режим работы службы ремонта Re/Ro: ${result.ReRo.toFixed(count)}`));
    resultDiv.appendChild(createResultField(`Убытки Y: ${result.Y.toFixed(count)}`));
    resultDiv.appendChild(createResultField(`Среднее время цикла для компьютера Tc: ${result.Tc.toFixed(count)} ч`));
}