import os

def generate_tree(start_path, prefix=""):
    tree = ""
    entries = sorted(os.listdir(start_path))
    entries = [e for e in entries if not e.startswith(".")]  # skip hidden files

    for index, entry in enumerate(entries):
        path = os.path.join(start_path, entry)
        connector = "├── " if index < len(entries) - 1 else "└── "
        tree += f"{prefix}{connector}{entry}\n"
        if os.path.isdir(path):
            extension = "│   " if index < len(entries) - 1 else "    "
            tree += generate_tree(path, prefix + extension)
    return tree

def main():
    root_dir = "src"  # start from src directory
    output_file = "project_structure.txt"

    if not os.path.exists(root_dir):
        print(f"Error: '{root_dir}' directory not found!")
        return

    print("Generating directory structure for src/...")
    tree_str = f"src/\n"
    tree_str += generate_tree(root_dir)
    
    # Fix: Specify UTF-8 encoding to handle Unicode characters
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(tree_str)

    print(f"Directory structure written to: {output_file}")

if __name__ == "__main__":
    main()