from evaluation.pycocoevalcap.meteor.meteor import Meteor
from evaluation.pycocoevalcap.rouge.rouge import Rouge


def main(hyp, ref):
    with open(hyp, 'r') as r:
        hypothesis = r.readlines()
        res = {k: [v.strip().lower()] for k, v in enumerate(hypothesis)}
    with open(ref, 'r') as r:
        references = r.readlines()
        tgt = {k: [v.strip().lower()] for k, v in enumerate(references)}

    score_Meteor, scores_Meteor = Meteor().compute_score(tgt, res)
    print("Meteor: %s" % score_Meteor)

    score_Rouge, scores_Rouge = Rouge().compute_score(tgt, res)
    print("ROUGE: %s" % score_Rouge)


if __name__ == '__main__':
    pred = "../result/10000retrieval"
    ref = "../result/ref/cleaned_test.msg"
    main(pred, ref)
