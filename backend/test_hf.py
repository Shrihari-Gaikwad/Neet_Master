from datasets import load_dataset

def test_download():
    try:
        print("Downloading dataset...")
        ds = load_dataset("catchshubham/neet-dataset")
        print("Download successful!")
        print(ds)
        print("Sample:", ds['train'][0])
    except Exception as e:
        print(f"Failed: {e}")

if __name__ == "__main__":
    test_download()
