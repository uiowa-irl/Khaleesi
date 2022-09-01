# Khaleesi
Artifact release for USENIX Security Symposium (USENIX), 2022 paper entitled Khaleesi: Breaker of Advertising and Tracking Request Chains.


## Training & Testing ML model 

### Data collection
We use [OpenWPM](https://github.com/openwpm/OpenWPM) to collect HTTP and JavaScript request chains. You may conduct a new crawl or use the homepage crawl of top-10K websites in [data](https://github.com/uiowa-irl/Khaleesi/blob/main/data/non-interactive-crawl.7z). The remaining data sets used in the paper are available on [Zenodo](https://doi.org/10.5281/zenodo.6084582).

 
### Request chain construction
Network-layer and JavaScript layer request chains can be constructed using [`http_chain_builder`](https://github.com/uiowa-irl/Khaleesi/blob/main/code/http_chain_builder_json.ipynb) and [`js_chain_builder`](https://github.com/uiowa-irl/Khaleesi/blob/main/code/js_chain_builder_json.ipynb).

Once constructed, the request chains can be labeled through [`filter_lists_labeling`](https://github.com/uiowa-irl/Khaleesi/blob/main/code/filter_lists_labeling.ipynb). Labeling code uses EasyList (EL) and EasyPrivacy (EP) filter lists to label ad/tracking requests. EL/EP are available in [ground_truth](https://github.com/uiowa-irl/Khaleesi/tree/main/ground_truth).


### Feature extraction and transformation
Features can be extracted using [`feature_extraction`](https://github.com/uiowa-irl/Khaleesi/blob/main/code/feature_extraction.ipynb) script. Once extracted, features need to be encoded using [`encode_features`](https://github.com/uiowa-irl/Khaleesi/blob/main/code/encode_features.ipynb) script. 


### Training the model 
Since, we rely on previous confidence as a feature, we need to extract the previous confidence for each request in a chain before we train the final model. The previous confidence can be extracted using [`compute_previous_confidence`](https://github.com/uiowa-irl/Khaleesi/blob/main/code/compute_previous_confidence.ipynb) script. The last block of previous confidence stores the final trained model. An already trained model is available in [data directory](https://github.com/uiowa-irl/Khaleesi/blob/main/data/final_clf.joblib).


### Testing the model 
We use 10-fold cross validation to test the datasets. The encoded features with previous confidence can be tested using [`test-classifier`](https://github.com/uiowa-irl/Khaleesi/blob/main/code/test-classifier.ipynb) script and the accuracy can be computed using [`compute-accuracy`](https://github.com/uiowa-irl/Khaleesi/blob/main/code/compute-accuracy.ipynb) script. 


## Analysis of Request Chains
We analyze use cases of request chains for advertising and tracking. [Cookie syncing](https://github.com/uiowa-irl/Khaleesi/blob/main/code/cookie_syncing_heuristic.ipynb) and [bounce tracking](https://github.com/uiowa-irl/Khaleesi/blob/main/code/bounce_tracking_investigation.ipynb) scripts can be used to identify cookie syncing and bounce tracking instances.


## Browser Extension
Khaleesi is implemented as a Firefox Add-on.

#### Usage
- Enter `about:debugging` in the URL bar
- Click "This Firefox"
- Click "Load Temporary Add-on"
- Navigate to the browser extension's directory and open `manifest.json`

To view which requests Khaleesi blocks, open the extension's console by clicking on "Inspect" in `about:debugging` or see the network tab in the Firefox Developer Tools.

*The browser extension uses gorhill's [publicsuffixlist.js](https://github.com/gorhill/publicsuffixlist.js) utility*

## Reference

**Khaleesi: Breaker of Advertising and Tracking Request Chains**\
Umar Iqbal, Charlie Wolfe, Charles Nguyen, Steven Englehardt, Zubair Shafiq\
*USENIX Security Symposium (USENIX), 2022*

**Abstract** &mdash; Request chains are being used by advertisers and trackers for information sharing and circumventing recently introduced privacy protections in web browsers. There is little prior work on mitigating the increasing exploitation of request chains by advertisers and trackers. The state-of-the-art ad and tracker blocking approaches lack the necessary context to effectively detect advertising and tracking request chains. We propose Khaleesi, a machine learning approach that captures the essential sequential context needed to effectively detect advertising and tracking request chains. We show that Khaleesi achieves high accuracy, that holds well over time, is generally robust against evasion attempts, and outperforms existing approaches. We also show that Khaleesi is suitable for online deployment and it improves page load performance.

**For more details please check our [full paper](https://umariqbal.com/papers/khaleesi-usenix2022.pdf)**

### Citation
If you use code/data in your research, please cite Khaleesi as follows:

```
@inproceedings{Iqbal22USENIXKhaleesi,
  title     = {Khaleesi: Breaker of Advertising and Tracking Request Chains},
  author    = {Umar Iqbal, Charlie Wolfe, Charles Nguyen, Steven Englehardt, Zubair Shafiq},
  booktitle = {USENIX Security Symposium (USENIX)},
  year      = {2022}
}
```

## Contact

*Please contact [Umar Iqbal](https://www.umariqbal.com) and [Charlie Wolfe](mailto:cw@charliewolfe.net) if you run into any problems running the code or if you have any questions about Khaleesi.*
