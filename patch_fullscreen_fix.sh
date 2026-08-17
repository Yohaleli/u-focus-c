cat << 'INNER_EOF' > replacement.txt
          ) : (
            <div className="space-y-2 max-h-[60vh] overflow-y-auto mb-4">
              {tasks.map(t => (
INNER_EOF
sed -i -e '161,162c\' -e "$(cat replacement.txt | sed 's/$/\\/')" src/components/FullScreenRoom.tsx
sed -i 's/\\$//g' src/components/FullScreenRoom.tsx
