import { SRAM } from 'tssv/lib/modules/SRAM'
import { writeFileSync } from 'fs';


const testMem_1rw = new SRAM({ dataWidth:8, depth: 32n, ports: '1rw', writeEnableMask: 'bit' })
try {
    writeFileSync(`sv-examples/${testMem_1rw.name}.sv`, testMem_1rw.writeSystemVerilog());
} catch (err) {
    console.error(err);
}

const testMem_2rw = new SRAM({ dataWidth:8, depth: 32n, ports: '2rw', writeEnableMask: 'bit' })
try {
    writeFileSync(`sv-examples/${testMem_2rw.name}.sv`, testMem_2rw.writeSystemVerilog());
} catch (err) {
    console.error(err);
}

const testMem_1r_1w = new SRAM({ dataWidth:8, depth: 32n, ports: '1r_1w', writeEnableMask: 'byte' })
try {
    writeFileSync(`sv-examples/${testMem_1r_1w.name}.sv`, testMem_1r_1w.writeSystemVerilog());
} catch (err) {
    console.error(err);
}