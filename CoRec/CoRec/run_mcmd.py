import os
import sys


language = "javascript"

data_dir = f"../../data/mcmd/{language}"

os.makedirs("data/preprocessed", exist_ok=True)


def controller(opt):
    if opt == "preprocess":        
        command = f"python3 preprocess.py -train_src {data_dir}/train.diff.txt \
                        -train_tgt {data_dir}/train.msg.txt \
                        -valid_src {data_dir}/valid.diff.txt \
                        -valid_tgt {data_dir}/valid.msg.txt \
                        -save_data data/preprocessed/mcmd_javascript \
                        -src_seq_length 1000 \
                        -lower \
                        -tgt_seq_length 1000 \
                        -src_seq_length_trunc 100 \
                        -tgt_seq_length_trunc 30"
        os.system(command)

    elif opt == "train":
        command = f"python3 train.py -word_vec_size 512 \
                                -enc_layers 2 \
                                -dec_layers 2 \
                                -rnn_size 512 \
                                -rnn_type LSTM \
                                -encoder_type brnn \
                                -decoder_type rnn \
                                -global_attention mlp \
                                -data data/preprocessed/mcmd_javascript \
                                -save_model models/CoRec_mcmd_javascript \
                                -gpu_ranks 0 1 2 3 \
                                -batch_size 64 \
                                -optim adam \
                                -learning_rate 0.001 \
                                -dropout 0.1 \
                                -train_steps 400000 \
                                -total 96704"

        os.system(command)
        print("done.")
    elif opt == "translate":
        print("Retrieve similar commits...")
        command = f"python3 translate.py -model models/CoRec_mcmd_javascript_step_400000.pt \
                                        -src {data_dir}/test.diff.txt \
                                        -train_diff {data_dir}/train.diff.txt \
                                        -train_msg {data_dir}/train.msg.txt \
                                        -semantic_msg data/output/semantic_mcmd_javascript.out \
                                        -output data/mcmd/new_javascript.sem.diff \
                                        -batch_size 64 \
                                        -gpu 0 \
                                        -fast \
                                        -mode 1 \
                                        -max_sent_length 100"

        os.system(command)
        print("Begin translation...")
        command = f"python3 translate.py -model models/CoRec_mcmd_javascript_step_400000.pt \
                            -src {data_dir}/test.diff.txt \
                            -output data/output/mcmd_javascript_test.out \
                            -sem_path data/mcmd/new_javascript.sem.diff \
                            -min_length 2 \
                            -max_length 30 \
                            -batch_size 64 \
                            -gpu 0 \
                            -fast \
                            -mode 2 \
                            -lam_sem 0.5 \
                            -max_sent_length 100"

        os.system(command)
        print('Done.')


if __name__ == '__main__':
    option = sys.argv[1]
    controller(option)
