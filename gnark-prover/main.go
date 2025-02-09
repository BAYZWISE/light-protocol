package main

import (
	"bytes"
	_ "embed"
	"encoding/json"
	"fmt"
	"io"
	"light/light-prover/config"
	"light/light-prover/logging"
	merkle_tree "light/light-prover/merkle-tree"
	"light/light-prover/prover"
	"light/light-prover/server"
	"math/big"
	"os"
	"os/signal"
	"strings"

	"github.com/consensys/gnark/constraint"
	gnarkLogger "github.com/consensys/gnark/logger"
	"github.com/urfave/cli/v2"
)

func main() {
	runCli()
}

func runCli() {
	gnarkLogger.Set(*logging.Logger())
	app := cli.App{
		EnableBashCompletion: true,
		Commands: []*cli.Command{
			{
				Name: "setup",
				Flags: []cli.Flag{
					&cli.StringFlag{Name: "circuit", Usage: "Type of circuit (\"inclusion\" / \"non-inclusion\")", Required: true},
					&cli.StringFlag{Name: "output", Usage: "Output file", Required: true},
					&cli.StringFlag{Name: "output-vkey", Usage: "Output file", Required: true},
					&cli.UintFlag{Name: "tree-depth", Usage: "Merkle tree depth", Required: true},
					&cli.UintFlag{Name: "utxos", Usage: "Number of Utxos", Required: true},
				},
				Action: func(context *cli.Context) error {
					circuit := context.String("circuit")
					path := context.String("output")
					path_vkey := context.String("output-vkey")
					treeDepth := uint32(context.Uint("tree-depth"))
					numberOfUtxos := uint32(context.Uint("utxos"))
					logging.Logger().Info().Msg("Running setup")

					var system *prover.ProvingSystem
					var err error
					system, err = prover.SetupCircuit(circuit, treeDepth, numberOfUtxos)
					if err != nil {
						return err
					}
					file, err := os.Create(path)
					defer func(file *os.File) {
						err := file.Close()
						if err != nil {
							logging.Logger().Error().Err(err).Msg("error closing file")
						}
					}(file)
					if err != nil {
						return err
					}
					written, err := system.WriteTo(file)
					if err != nil {
						return err
					}
					logging.Logger().Info().Int64("bytesWritten", written).Msg("proving system written to file")
					prover, err := prover.ReadSystemFromFile(path)
					if err != nil {
						return err
					}
					var buf bytes.Buffer
					_, err = prover.VerifyingKey.WriteRawTo(&buf)

					proofBytes := buf.Bytes()
					err = createFileAndWriteBytes(path_vkey, proofBytes)
					if err != nil {
						return err
					}
					return nil
				},
			},
			{
				Name: "r1cs",
				Flags: []cli.Flag{
					&cli.StringFlag{Name: "output", Usage: "Output file", Required: true},
					&cli.UintFlag{Name: "tree-depth", Usage: "Merkle tree depth", Required: true},
					&cli.UintFlag{Name: "utxos", Usage: "Number of utxos", Required: true},
				},
				Action: func(context *cli.Context) error {
					path := context.String("output")
					treeDepth := uint32(context.Uint("tree-depth"))
					utxos := uint32(context.Uint("utxos"))
					logging.Logger().Info().Msg("Building R1CS")

					var cs constraint.ConstraintSystem
					var err error

					cs, err = prover.R1CSInclusion(treeDepth, utxos)

					if err != nil {
						return err
					}
					file, err := os.Create(path)
					defer func(file *os.File) {
						err := file.Close()
						if err != nil {
							logging.Logger().Error().Err(err).Msg("error closing file")
						}
					}(file)
					if err != nil {
						return err
					}
					written, err := cs.WriteTo(file)
					if err != nil {
						return err
					}
					logging.Logger().Info().Int64("bytesWritten", written).Msg("R1CS written to file")
					return nil
				},
			},
			{
				Name: "import-setup",
				Flags: []cli.Flag{
					&cli.StringFlag{Name: "circuit", Usage: "Type of circuit (\"inclusion\" / \"non-inclusion\")", Required: true},
					&cli.StringFlag{Name: "output", Usage: "Output file", Required: true},
					&cli.StringFlag{Name: "pk", Usage: "Proving key", Required: true},
					&cli.StringFlag{Name: "vk", Usage: "Verifying key", Required: true},
					&cli.UintFlag{Name: "tree-depth", Usage: "Merkle tree depth", Required: true},
					&cli.UintFlag{Name: "utxos", Usage: "Number of utxos", Required: true},
				},
				Action: func(context *cli.Context) error {
					circuit := context.String("circuit")
					path := context.String("output")
					pk := context.String("pk")
					vk := context.String("vk")
					treeDepth := uint32(context.Uint("tree-depth"))
					utxos := uint32(context.Uint("utxos"))
					var system *prover.ProvingSystem
					var err error

					logging.Logger().Info().Msg("Importing setup")

					if circuit == "inclusion" {
						system, err = prover.ImportInclusionSetup(treeDepth, utxos, pk, vk)
					} else if circuit == "non-inclusion" {
						system, err = prover.ImportNonInclusionSetup(treeDepth, utxos, pk, vk)
					} else {
						return fmt.Errorf("invalid circuit type %s", circuit)
					}

					if err != nil {
						return err
					}

					file, err := os.Create(path)
					defer func(file *os.File) {
						err := file.Close()
						if err != nil {
							logging.Logger().Error().Err(err).Msg("error closing file")
						}
					}(file)
					if err != nil {
						return err
					}
					written, err := system.WriteTo(file)
					if err != nil {
						return err
					}
					logging.Logger().Info().Int64("bytesWritten", written).Msg("proving system written to file")
					return nil
				},
			},
			{
				Name: "export-vk",
				Flags: []cli.Flag{
					&cli.StringFlag{Name: "keys-file", Aliases: []string{"k"}, Usage: "proving system file", Required: true},
					&cli.StringFlag{Name: "output", Usage: "output file", Required: true},
				},
				Action: func(context *cli.Context) error {
					keys := context.String("keys-file")
					ps, err := prover.ReadSystemFromFile(keys)
					if err != nil {
						return err
					}
					outPath := context.String("output")

					file, err := os.Create(outPath)
					defer func(file *os.File) {
						err := file.Close()
						if err != nil {
							logging.Logger().Error().Err(err).Msg("error closing file")
						}
					}(file)
					if err != nil {
						return err
					}
					output := file
					_, err = ps.VerifyingKey.WriteTo(output)
					return err
				},
			},
			{
				Name: "gen-test-params",
				Flags: []cli.Flag{
					&cli.IntFlag{Name: "tree-depth", Usage: "depth of the mock tree", DefaultText: "26", Value: 26},
					&cli.IntFlag{Name: "utxos", Usage: "Number of utxos", DefaultText: "1", Value: 1},
				},
				Action: func(context *cli.Context) error {
					treeDepth := context.Int("tree-depth")
					utxos := context.Int("utxos")
					logging.Logger().Info().Msg("Generating test params for the inclusion circuit")

					var r []byte
					var err error

					params := merkle_tree.BuildTestTree(treeDepth, utxos, false)

					r, err = json.Marshal(&params)

					if err != nil {
						return err
					}

					fmt.Println(string(r))
					return nil
				},
			},
			{
				Name: "start",
				Flags: []cli.Flag{
					&cli.BoolFlag{Name: "json-logging", Usage: "enable JSON logging", Required: false},
					&cli.StringFlag{Name: "prover-address", Usage: "address for the prover server", Value: "localhost:3001", Required: false},
					&cli.StringFlag{Name: "metrics-address", Usage: "address for the metrics server", Value: "localhost:9998", Required: false},
					&cli.StringFlag{
						Name:     "config",
						Aliases:  []string{"c"},
						Usage:    "Load configuration from `FILE`",
						Required: false,
					},
					&cli.StringSliceFlag{Name: "keys-file", Aliases: []string{"k"}, Value: cli.NewStringSlice(), Usage: "Proving system file"},
				},
				Action: func(context *cli.Context) error {
					if context.Bool("json-logging") {
						logging.SetJSONOutput()
					}

					ps, err := LoadKeysFromConfigOrInline(context)
					if err != nil {
						return err
					}

					merkleConfig := server.Config{
						ProverAddress:  context.String("prover-address"),
						MetricsAddress: context.String("metrics-address"),
					}
					instance := server.Run(&merkleConfig, ps)
					sigint := make(chan os.Signal, 1)
					signal.Notify(sigint, os.Interrupt)
					<-sigint
					logging.Logger().Info().Msg("Received sigint, shutting down")
					instance.RequestStop()
					logging.Logger().Info().Msg("Waiting for server to close")
					instance.AwaitStop()
					return nil
				},
			},
			{
				Name: "prove",
				Flags: []cli.Flag{
					&cli.StringFlag{
						Name:     "config",
						Aliases:  []string{"c"},
						Usage:    "Load configuration from `FILE`",
						Required: false,
					},
					&cli.StringSliceFlag{Name: "keys-file", Aliases: []string{"k"}, Value: cli.NewStringSlice(), Usage: "Proving system file"},
				},
				Action: func(context *cli.Context) error {

					ps, err := LoadKeysFromConfigOrInline(context)
					if err != nil {
						return err
					}

					logging.Logger().Info().Msg("Reading params from stdin")
					bytes, err := io.ReadAll(os.Stdin)
					if err != nil {
						return err
					}

					var proof *prover.Proof
					var params prover.InclusionParameters
					err = json.Unmarshal(bytes, &params)
					if err != nil {
						return err
					}

					treeDepth := params.TreeDepth()
					if treeDepth != 26 {
						return fmt.Errorf("tree depth must be 26, got %d", treeDepth)
					}

					utxos := params.NumberOfUTXOs()

					for _, provingSystem := range ps {
						if provingSystem.TreeDepth == treeDepth && provingSystem.NumberOfUtxos == utxos {
							proof, err = provingSystem.ProveInclusion(&params)
							if err != nil {
								return err
							}
							r, _ := json.Marshal(&proof)
							fmt.Println(string(r))
							break
						}
					}

					return nil
				},
			},
			{
				Name: "verify",
				Flags: []cli.Flag{
					&cli.StringFlag{Name: "keys-file", Aliases: []string{"k"}, Usage: "proving system file", Required: true},
					&cli.StringFlag{Name: "roots", Usage: "array of roots", Required: true},
					&cli.StringFlag{Name: "leafs", Usage: "array of leafs", Required: true},
				},
				Action: func(context *cli.Context) error {
					keys := context.String("keys-file")

					rootInputString := context.String("roots")
					rootStrings := strings.Split(rootInputString, ",")
					roots := make([]big.Int, len(rootStrings))

					for i, rootString := range rootStrings {
						rootString = strings.ToLower(strings.TrimSpace(rootString))
						rootString = strings.TrimPrefix(rootString, "0x")
						val := new(big.Int)
						val.SetString(rootString, 16)
						roots[i] = *val
					}

					leafInputString := context.String("leafs")
					leafStrings := strings.Split(leafInputString, ",")
					leafs := make([]big.Int, len(leafStrings))

					for i, leafString := range leafStrings {
						leafString = strings.ToLower(strings.TrimSpace(leafString))
						leafString = strings.TrimPrefix(leafString, "0x")
						val := new(big.Int)
						val.SetString(leafString, 16)
						leafs[i] = *val
					}

					ps, err := prover.ReadSystemFromFile(keys)
					if err != nil {
						return err
					}
					logging.Logger().Info().Uint32("treeDepth", ps.TreeDepth).Uint32("utxos", ps.NumberOfUtxos).Msg("Read proving system")
					logging.Logger().Info().Msg("Reading proof from stdin")
					bytes, err := io.ReadAll(os.Stdin)
					if err != nil {
						logging.Logger().Err(err).Msg("error reading proof from stdin")
						return err
					}
					logging.Logger().Info().Msg("Parsing proof from stdin")
					var proof prover.Proof
					err = json.Unmarshal(bytes, &proof)
					if err != nil {
						logging.Logger().Err(err).Msg("error unmarshalling proof from stdin")
						return err
					}
					logging.Logger().Info().Msg("Proof read successfully")
					err = ps.VerifyInclusion(roots, leafs, &proof)
					if err != nil {
						return err
					}
					logging.Logger().Info().Msg("verification complete")
					return nil
				},
			},
			{
				Name: "extract-circuit",
				Flags: []cli.Flag{
					&cli.StringFlag{Name: "output", Usage: "Output file", Required: true},
					&cli.UintFlag{Name: "tree-depth", Usage: "Merkle tree depth", Required: true},
					&cli.UintFlag{Name: "utxos", Usage: "Number of utxos", Required: true},
				},
				Action: func(context *cli.Context) error {
					path := context.String("output")
					treeDepth := uint32(context.Uint("tree-depth"))
					utxos := uint32(context.Uint("utxos"))
					logging.Logger().Info().Msg("Extracting gnark circuit to Lean")
					circuitString, err := prover.ExtractLean(treeDepth, utxos)
					if err != nil {
						return err
					}
					file, err := os.Create(path)
					defer func(file *os.File) {
						err := file.Close()
						if err != nil {
							logging.Logger().Error().Err(err).Msg("error closing file")
						}
					}(file)
					if err != nil {
						return err
					}
					written, err := file.WriteString(circuitString)
					if err != nil {
						return err
					}
					logging.Logger().Info().Int("bytesWritten", written).Msg("Lean circuit written to file")

					return nil
				},
			},
		},
	}

	if err := app.Run(os.Args); err != nil {
		logging.Logger().Fatal().Err(err).Msg("App failed.")
	}
}

func LoadKeysFromConfigOrInline(context *cli.Context) ([]*prover.ProvingSystem, error) {
	var cfg = config.Config{}

	if context.IsSet("config") {
		configFile := context.String("config")
		cfg, _ = config.ReadConfig(configFile)
	}

	if context.IsSet("keys-file") {
		keys := context.StringSlice("keys-file")
		for _, key := range keys {
			trimmed := strings.TrimSpace(key)
			if !cfg.HasKey(trimmed) {
				cfg.Keys = append(cfg.Keys, trimmed)
			}
		}
	}
	if len(cfg.Keys) == 0 {
		logging.Logger().Info().Msg("No config file provided, using defaults")
		cfg = config.Config{
			Keys: []string{
				"circuits/inclusion_26_1.key",
				"circuits/inclusion_26_2.key",
				"circuits/inclusion_26_3.key",
				"circuits/inclusion_26_4.key",
				"circuits/inclusion_26_8.key",
				"circuits/non-inclusion_26_1.key",
				"circuits/non-inclusion_26_2.key",
			},
		}
	}

	var pss = make([]*prover.ProvingSystem, len(cfg.Keys))

	for i, key := range cfg.Keys {
		logging.Logger().Info().Msg("Reading proving system from file " + key + "...")
		ps, err := prover.ReadSystemFromFile(key)
		if err != nil {
			return nil, err
		}
		pss[i] = ps
		logging.Logger().Info().Uint32("treeDepth", ps.TreeDepth).Uint32("utxos", ps.NumberOfUtxos).Msg("Read proving system")
	}
	return pss, nil
}

func createFileAndWriteBytes(filePath string, data []byte) error {
	// Create or open the file for writing. The file is created if it does not exist,
	// or truncated if it does.
	file, err := os.Create(filePath)
	if err != nil {
		return err // Return the error to the caller
	}
	defer file.Close() // Ensure the file is closed when the function completes

	// Write the bytes to the file
	_, err = io.WriteString(file, fmt.Sprintf("%d", data))
	if err != nil {
		return err // Return any error that occurs during writing
	}
	fmt.Println("Wrote", len(data), "bytes to", filePath) // Write a log message
	return nil                                            // No errors, return nil
}
