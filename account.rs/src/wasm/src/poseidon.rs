use ark_bn254::Fr;
use js_sys::{Array, Uint8Array};
use light_poseidon::{Poseidon, PoseidonBytesHasher, PoseidonError};
use num_bigint::BigUint;
use wasm_bindgen::{prelude::wasm_bindgen, JsValue};

use crate::utils::set_panic_hook;

#[wasm_bindgen]
pub fn poseidon(inputs: &Array) -> Result<Uint8Array, JsValue> {
    set_panic_hook();

    let inputs_res: Result<Vec<Vec<u8>>, JsValue> = inputs
        .iter()
        .map(|val| {
            if let Some(str_val) = val.as_string() {
                let big_int = BigUint::parse_bytes(str_val.as_bytes(), 10)
                    .ok_or_else(|| JsValue::from_str("Error parsing string to BigUint"))?;
                Ok(big_int.to_bytes_be())
            } else {
                Err(JsValue::from_str(
                    "All elements in the array should be strings representable as numbers",
                ))
            }
        })
        .collect();

    let hash_res = poseidon_hash(inputs_res?);
    match hash_res {
        Ok(val) => {
            let js_arr = Uint8Array::from(&val[..]);
            Ok(js_arr)
        }
        Err(e) => Err(JsValue::from_str(&e.to_string())),
    }
}

pub fn poseidon_hash(input: Vec<Vec<u8>>) -> Result<Vec<u8>, PoseidonError> {
    let temp: Vec<&[u8]> = input.iter().map(AsRef::as_ref).collect();
    let input_slice = temp.as_slice();

    let hasher = Poseidon::<Fr>::new_circom(input.len());
    let hash = hasher?.hash_bytes_be(input_slice);
    Ok(hash?.to_vec())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn poseidon_1() {
        let hash_of_1: [u8; 32] = [
            41, 23, 97, 0, 234, 169, 98, 189, 193, 254, 108, 101, 77, 106, 60, 19, 14, 150, 164,
            209, 22, 139, 51, 132, 139, 137, 125, 197, 2, 130, 1, 51,
        ];

        let input_of_1 = [vec![0u8; 31], vec![1u8]].concat();
        let inputs = vec![input_of_1];
        let hash = poseidon_hash(inputs);
        assert_eq!(hash?, hash_of_1.to_vec());
    }

    #[test]
    fn poseidon_216() {
        let inputs = vec![
            216, 137, 85, 159, 239, 194, 107, 138, 254, 68, 21, 16, 165, 41, 64, 148, 208, 198,
            201, 59, 220, 102, 142, 81, 49, 251, 174, 183, 183, 182, 4, 32,
        ];
        let mut hasher = Poseidon::<Fr>::new_circom(1).unwrap();
        let hash = hasher.hash_bytes_be(&[inputs.as_slice()]);

        assert!(hash.is_err());
    }
}