import { Module } from 'tssv/lib/core/TSSV';
import { TL_UL } from 'tssv/lib/interfaces/TL_UL';
import { writeFileSync } from 'fs';
export class Adder extends Module {
    constructor(params) {
        super({
            // define the default parameter values
            aWidth: params.aWidth || 8,
            bWidth: params.bWidth || 8
        });
        // add Tilelink UL responder interface
        this.addInterface('regs', new TL_UL({}, 'responder'));
        // define IO signals
        this.IOs = {
            a: { direction: 'input', width: this.params.aWidth, isSigned: true },
            b: { direction: 'input', width: this.params.bWidth, isSigned: true },
            sum: { direction: 'output', width: Math.max((this.params.aWidth || 1), (this.params.bWidth || 1)) + 1, isSigned: true }
        };
        this.addAdder({ a: 'a', b: 'b', result: 'sum' });
    }
}
export class Adder3 extends Module {
    constructor(params) {
        super({
            // define the default parameter values
            aWidth: params.aWidth || 8,
            bWidth: params.bWidth || 8,
            cWidth: params.bWidth || 8
        });
        this.addInterface('regs1', new TL_UL({}));
        this.addInterface('regs2', new TL_UL({}));
        // define IO signals
        const sumWidth = Math.max((this.params.aWidth || 1), (this.params.bWidth || 1, (this.params.cWidth || 1))) + 2;
        this.IOs = {
            a: { direction: 'input', width: this.params.aWidth, isSigned: true },
            b: { direction: 'input', width: this.params.bWidth, isSigned: true },
            c: { direction: 'input', width: this.params.bWidth, isSigned: true },
            clk: { direction: 'input', isClock: 'posedge' },
            rst_b: { direction: 'input', isReset: 'lowasync' },
            sum: { direction: 'output', width: sumWidth, isSigned: true }
        };
        const psumWidth = Math.max((this.params.aWidth || 1), (this.params.bWidth || 1)) + 1;
        const psum = this.addSignal('psum', { width: psumWidth });
        this.addSubmodule('add1', new Adder({ aWidth: this.params.aWidth, bWidth: this.params.bWidth }), { sum: psum, regs: 'regs1' });
        this.addSignal("sum_d", { width: sumWidth });
        this.addSubmodule('add2', new Adder({ aWidth: this.params.cWidth, bWidth: psumWidth }), { a: "c", b: "psum", sum: 'sum_d', regs: 'regs2' });
        this.addSequentialAlways({
            clk: 'clk',
            reset: 'rst_b',
            outputs: ['sum']
        }, `
    always_ff @(posedge clk or negedge rst_b)
      if(!rst_b)
        sum <= '0;
      else
        sum <= sum_d;
`);
    }
}
export class testMem extends Module {
    constructor(params) {
        super(params);
        this.IOs = {
            data_in: { direction: 'input', width: this.params.dataWidth },
            addr: { direction: 'input', width: this.bitWidth(this.params.depth) },
            we: { direction: 'input' },
            re: { direction: 'input' },
            clk: { direction: 'input', isClock: 'posedge' },
            data_out: { direction: 'output', width: this.params.dataWidth, isSigned: true }
        };
        this.addSignal("mem", { width: this.params.dataWidth, isArray: this.params.depth });
        this.addSequentialAlways({ clk: 'clk', outputs: ['mem', 'data_out'] }, `
  always_ff @(posedge clk)
    begin
      if(we)
        mem[addr] <= data_in;
      if(re)
        data_out <= mem[addr];
    end          
`);
    }
}
const test1 = new Adder3({ aWidth: 8, bWidth: 8, cWidth: 8 });
try {
    writeFileSync('sv-examples/test1.sv', test1.writeSystemVerilog());
}
catch (err) {
    console.error(err);
}
const testMem1 = new testMem({ dataWidth: 8, depth: 32 });
try {
    writeFileSync('sv-examples/testMem1.sv', testMem1.writeSystemVerilog());
}
catch (err) {
    console.error(err);
}
