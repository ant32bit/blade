import os
import sys
import shutil
from hashlib import md5

def get_file_hash(filename):
    with open(filename, 'rb') as fh:
        c = fh.read()
        return md5(c).hexdigest()

def get_extension(filename):
    _, ext = os.path.splitext(filename)
    return ext

def make_root_files(env):
    env = os.path.dirname(env + '/') + '/'
    root_template = 'root-template/'
    www_root = env + 'www-root/'

    bundle_js = env + 'bundle.js'
    index_html = 'index.html'

    if os.path.exists(www_root):
        print('clearing root files')
        shutil.rmtree(www_root)

    os.makedirs(www_root)
    
    new_js = get_file_hash(bundle_js) + '.js'
    print(f'copying bundle.js as {new_js}')
    shutil.copyfile(bundle_js, www_root + new_js)

    other_files = { 'bundle.js': new_js }

    for file in os.listdir(root_template):
        if file != index_html:
            new_file = get_file_hash(root_template + file) + get_extension(file)
            print(f'copying {file} as {new_file}')
            shutil.copyfile(root_template + file, www_root + new_file)
            other_files[file] = new_file

    with open(root_template + index_html) as fh:
        index_html_content = fh.read()
    
    for file in other_files.keys():
        index_html_content = index_html_content.replace('{{' + file + '}}', other_files[file])

    with open(www_root + index_html, 'w') as fh:
        print('writing index.html')
        fh.write(index_html_content)
    
if __name__ == "__main__":
    print('\n')
    make_root_files('dist/')
    print('\n')
    